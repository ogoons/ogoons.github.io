---
layout: post
title: "[ExoPlayer] Pre-loading and Caching in ExoPlayer"
categories: ExoPlayer Android 
---

ExoPlayer 라이브러에서 캐시 기능을 구현하고 사전 다운로드 하는 방법을 알아봅니다.  
라이브러리에 내장된 관련 API 를 사용하면, 다운로드나 캐시 기능을 추가적으로 구현하지 않고도 간단하게 목적을 달성할 수 있습니다.

> 이 글은 새로운 Media3 패키지가 아닌 독립 실행형 라이브러리인 `com.google.android.exoplayer:exoplayer:2.18.1` 를 기준으로 작성되었습니다.  
Media3 와는 패키지만 다른 동일한 라이브러리 임을 참고하시길 바랍니다.

## 다운로드한 비디오를 캐시할 SimpleCache 구성

`SimpleCache` 클래스를 사용하면 간단한 방법으로 비디오의 캐시를 구성할 수 있습니다. 

~~~kotlin
val cacheMaxSize: Long = 90 * 1024 * 1024
val cacheRoot = context.externalCacheDir ?: context.cacheDir // 캐시된 파일이 저장될 디렉토리의 루트
val cacheDir = File(cacheRoot, "media") // 캐시된 파일이 저장될 최종 디렉토리(media)

val simpleCache = SimpleCache(cacheDir, LeastRecentlyUsedCacheEvictor(cacheMaxSize), StandaloneDatabaseProvider(context)) // 하나의 인스턴스만 하용하므로 싱글톤 패턴의 Wrapper를 구성하는 것을 권장
~~~

### SimpleCache

캐시 관리자 클래스, 캐시된 파일을 삭제해야 한다면 디렉토리에서 직접 삭제하지 말고 `delete()` 메소드 호출을 통해서 삭제해야 합니다.

### LeastRecentlyUsedCacheEvictor

LRU 알고리즘으로 구현한 캐시 축출자 입니다.  
오랫동안 사용하지 않은 비디오 캐시를 라이브러리에게 알려주고 제거하는 역할을 합니다.

### StandaloneDatabaseProvider

캐시된 파일을 관리할 데이터베이스가 필요하므로, `SQLiteOpenHelper` 를 독립적으로 사용할 수 있는 인스턴스를 제공합니다.

## CacheDataSource 구성

~~~kotlin
val httpDataSourceFactory = DefaultHttpDataSource.Factory()

val cacheDataSourceFactory = CacheDataSource.Factory()
    .setCache(simpleCache)
    .setUpstreamDataSourceFactory(httpDataSourceFactory)
    .setFlags(CacheDataSource.FLAG_IGNORE_CACHE_ON_ERROR) // 캐시 관련 오류 발생 후 캐시에 대한 무시 허용
~~~

### DefaultHttpDataSource

HTTP 기반의 업스트림에서 비디오를 내려받기 위한 클래스 입니다.  

기본적으로 프로토콜 간에 리디렉션을 지원하지 않습니다.  
지원하려면 `DefaultHttpDataSource.Factory.setAllowCrossProtocolRedirects(boolean)` true 로 설정합니다.

### CacheDataSource

DataSource를 읽고 쓰기 위한 클래스 입니다.

캐시가 설정이 되어있는 경우 파일에 대한 요청은 캐시에서 Read/Write 됩니다.  
캐시되지 않으면 업스트림에서 요청되어 DataSource 캐시에 기록됩니다.

## 이제 비디오를 재생해보자

비디오를 재생하고 캐시하기 위한 모든 준비가 끝났습니다.  
아래 코드는 비디오 재생을 위한 코드 조각입니다.

~~~kotlin
val mediaSourceFactory = ProgressiveMediaSource.Factory(cacheDataSourceFactory)

val loadControl = DefaultLoadControl.Builder()
    .setBufferDurationsMs(8 * 1024, 64 * 1024, 50, 1024)
    .build()
    
val player = ExoPlayer.Builder(context)
    .setMediaSourceFactory(mediaSourceFactory)
    .setLoadControl(loadControl)
    .build().apply {
        playWhenReady = false
    }

player.prepare()
player.play()
~~~

`prepare()` 호출과 동시에 비디오는 앱 내 cache 디렉토리에 자동으로 캐시되고 오랫동안 사용하지 않으면 삭제됩니다.

여기서 `play()` 를 호출하면 비디오를 내려받고 재생이 가능한 상태로 만들기 위해 약간의 시간이 필요합니다.  
사용자에겐 이 적은 시간이 답답함으로 느껴질 수 있습니다.

## ProgressiveDownloader 를 통한 사전 캐싱

이를 개선하기 위해 ProgressiveDownloader 클래스를 사용하여 미리 비디오를 다운로드 받아놓고 플레이어에서 즉각적인 재생을 준비할 수 있습니다.

~~~kotlin
val mediaItem = MediaItem.fromUri(url)
val downloader = ProgressiveDownloader(mediaItem, cacheDataSourceFactory)

downloader.download { contentLength, bytesDownloaded, percentDownloaded ->
    Log.d(TAG,
        "contentLength: $contentLength, bytesDownloaded: $bytesDownloaded, percentDownloaded: $percentDownloaded")
    // 다운로드 상태
}
~~~

### ProgressiveDownloader

스트리밍이 아닌 파일 다운로드로 비디오를 가져오기 위한 클래스 입니다.

이외에 `SsDownloader`, `DashDownloader`, `HlsDownloader` 등 다양한 형식의 다운로드를 지원하고 있습니다.

## Conclusion

`ProgressiveDownloader` 를 사용한 **Pre-loading/cashing** 기법은 개발자가 적절한 전략을 세우고 구현하지 않으면, 오히려 앱의 자원낭비와 전반적인 성능저하를 불러 일으킬 수 있습니다.  
사용자가 반드시 해당 비디오를 플레이 할 것이라는 보장이 없다면 무조건 적인 다운로드는 통신 데이터 등의 불필요한 자원소비가 발생할 수 있습니다.  
때문에 어떻게 비디오를 미리 캐싱할 것인지에 대한 충분한 전략을 수립하는 것이 무엇보다 중요합니다.

## References

https://developer.android.com/guide/topics/media/exoplayer/downloading-media





