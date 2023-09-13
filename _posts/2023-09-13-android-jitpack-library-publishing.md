---
layout: post
title: "[Android] JitPack 에서 안드로이드 라이브러리를 빠르게 배포해보자"
categories: Android
---

이 글은 Maven 이 아닌 JitPack 를 통한 안드로이드 라이브러리(aar)를 배포하는 방법을 설명합니다.  
더불어 이 글을 작성하는 시점(23.09.13) 최신 버전인 **Gradle 8.3** 과 **AGP 8.1.1** 에서 Jitpack 빌드 실패에 대한 트러블 슈팅 후기도 함께합니다.

## 1. 안드로이드 라이브러리 만들기

일반 안드로이드 프로젝트를 생성 후 `New > New Module` 메뉴를 통하여 생성합니다.  
자세한 내용은 아래 안드로이드 공식 문서에 모두 설명이 되어있으므로
이 글에서는 다루지 않겠습니다.
> 안드로이드 공식 문서: https://developer.android.com/studio/projects/android-library#CreateLibrary

> 예제 소스코드 참고: https://github.com/ogoons/mylibrary

## 2. GitHub 에 라이브러리 업로드 후 태깅

1. 임의의 GitHub 레포지토리(`mylibrary`) 생성 
2. 생성한 라이브러리 소스 코드를 푸시
3. 푸시 완료한 GitHub 레포지토리 페이지 이동 후 우측 `Release` 메뉴 클릭
4. `Draft a new release` 버튼 클릭
5. Choose a tag 에서 새로운 버전명의 태그(1.0.0) 생성
6. 하단 섹션 입력은 필수가 아니므로 바로 하단 `Publish release` 클릭
7. 릴리스와 태그 생성 완료

## 3. jitpack.io 에 트리거 된 새 버전의 라이브러리 확인

1. https://jitpack.io/ 이동
2. JitPack 에서 GitHub 로그인 후 다음과 같이 `UserName/RepositoryName` 입력 후 `Look up` 클릭  
<img src="/assets/images/2023-09-13-android-jitpack-library-publishing-01.png" width="50%" height="50%">

3. 클릭 후 `Get it` 버튼을 누르거나 프로그래스 바가 진행이 되면 빌드를 시작합니다.
4. 빌드가 성공하면 아래와 같은 녹색 로그 아이콘을 볼 수 있습니다.  
<img src="/assets/images/2023-09-13-android-jitpack-library-publishing-02.png" width="50%" height="50%">  
실패한다면 로그를 확인하여 문제를 해결한 후 2-3번 항목부터 반복합니다.  

5. 하단에 라이브러리 통합을 가이드하는 섹션이 생성됩니다.  
안내에 따라 추가하고자 하는 프로젝트 `build.gradle` 파일에 추가해주면 됩니다.  
<img src="/assets/images/2023-09-13-android-jitpack-library-publishing-03.png" width="50%" height="50%">

## Gradle, AGP 최신 버전에서의 빌드 실패 이슈

- **Gradle 8.3**
- **AGP 8.1.1**

위와 같은 환경의 빌드 시스템을 구성 후 JitPack 을 트리거 하면, AGP 8.1.1 과 일치하는 변형을 찾을 수 없다면서 빌드가 더 이상 진행이 되지 않는 문제가 있습니다.

> No matching variant of com.android.tools.build:gradle:8.1.1 was found. the consumer was configured to find a library for use during runtime, compatible with java 8, packaged as a jar, and its dependencies declared externally, as well as attribute 'org.gradle.plugin.api-version' with value '8.3'
...

JitPack 에서 아직 최신 버전의 Gradle, AGP 를 지원하지 않는 것 처럼 보입니다.

일단, 이럴 경우는 프로젝트 루트 경로에 `jitpack.yml` 환경설정 파일을 필수로 추가해주어야 JitPack 에서 정상적인 빌드가 가능합니다.

<img src="/assets/images/2023-09-13-android-jitpack-library-publishing-04.png" width="25%" height="25%">

파일 내용은 다음과 같습니다.

~~~
jdk:
  - openjdk17
~~~

필자는 OpenJDK 17 환경에서 빌드가 되도록 설정하였습니다.  
이 부분은 각자 개발된 환경에 맞게 설정하면 됩니다.

추가로 이 환경의 빌드 시스템으로 구성된 라이브러리를 성공적으로 배포하였다 해도, 같은 환경의 프로젝트에 통합 후 빌드 시에 Duplicate class 오류가 발생하는 이슈가 있습니다.

External Libraries 를 살펴보니 중복으로 aar 이 로딩되는 것으로 확인이 되는데 7.x 버전으로 다운그레이드 하여 시도해보면 문제가 없었습니다.  
아래는 다운그레이드를 시도한 버전명 입니다.

- **Gradle 7.5.1**
- **AGP 7.4.2**

아무래도 8.x 버전의 버그로 생각이 됩니다.  
같은 문제로 힘들어하는 안드로이드 개발자들을 위해 공유합니다.  
아직 이슈 트래커나 온라인 상에 공유된 자료가 없어서, 이 문제가 해결이 되면 본문에 업데이트 하도록 하겠습니다.


