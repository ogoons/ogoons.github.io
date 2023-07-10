---
layout: post
title: "SharedFlow, StateFlow 알아보기"
categories: Coroutine Flow
---

LiveData 라는 Observer 패턴을 구현하기 위한 훌륭한 도구가 있지만 Android 에서 만 사용 가능한 단점이 있기에 Flow 를 사용한 데이터 스트림 구현을 권장합니다.

## SharedFlow

구독자에게 Flow 를 이용한 효율적인 데이터 방출을 목적으로 만들어졌습니다.

```kotlin
public fun <T> MutableSharedFlow(
    replay: Int = 0,
    extraBufferCapacity: Int = 0,
    onBufferOverflow: BufferOverflow = BufferOverflow.SUSPEND
): MutableSharedFlow<T>
```

각 파라미터에 대한 설명입니다.

### replay

이전에 내보낸 여러 값을 새 구독자에게 다시 보낼 수 있습니다.

### extraBufferCapacity

설정한 갯수만큼 추가적인 버퍼를 생성하고 emit 한 데이터를 버퍼에 적재

### onBufferOverflow

버퍼가 가득찬 경우에 아래 옵션으로 정책을 정할 수 있습니다.

- **BufferOverflow.SUSPEND :** emit 이 blocking 됩니다.
- **BufferOverflow.DROP_LATEST :** 가장 최근 값을 버리고, 새로운 값으로 대체합니다.
- **BufferOverflow.DROP_OLDEST :** 가장 오래된 값을 버리고, 새로운 값으로 대체합니다.

## StateFlow

이름 그대로 구독자에게 상태 데이터를 방출하기 위해 만들어졌습니다. 

SharedFlow 의 Subclass 로 특징적인 부분은 다음과 같습니다.

1. 초기값을 필요로 합니다.
2. SharedFlow 의 Replay Cache 가 지원되지 않습니다.
3. 중복된 데이터를 무시합니다.
4. 단 하나의 데이터의 최신 상태만을 유지하고 있습니다.