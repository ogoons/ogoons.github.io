---
layout: post
title: "[Coroutine] Flow & SharedFlow & StateFlow 알아보기"
categories: Flow SharedFlow StateFlow
---

`LiveData` 라는 Observer 패턴을 구현하기 위한 훌륭한 도구가 있지만 Android 에서 만 사용 가능한 단점이 있기에 코틀린에서 지원하는 `Flow` 를 사용한 데이터 스트림 구현을 권장합니다.  
이 글에서는 `Flow` 의 개념과 확장 인터페이스인 `SharedFlow`, `StateFlow` 에 대해 알아봅니다.

`Flow` 는 **Cold Stream**, `SharedFlow` 와 `StateFlow` 는 **Hot Stream** 입니다.
이 부분에 대해 먼저 짚고 넘어가보겠습니다.

## Cold Stream
- 데이터를 구독(`collect()`)한 시점에 flow block 이 실행되어 데이터를 방출(`emit()`)됩니다.
- 데이터는 flow 내부에서 생성됩니다.
- 하나의 생산자와 하나의 소비자만 존재합니다.(1:1)
- 보통 하나의 CD와 이를 재생하는 하나의 CD 플레이어로 비유됩니다.

## Hot Stream
- 데이터를 구독(`collect()`)한 시점에는 flow block 이 실행되지 않고 그 시점부터 방출(`emit()`)되는 데이터를 가져옵니다.
- 데이터는 flow 외부에서 생성됩니다.
- 하나의 생산자와 다수의 소비자가 존재합니다.(1:N)
- 보통 다수의 청취자가 하나의 라디오 주파수를 맞추는 행위와 비유됩니다.

## Flow

코루틴 패키지 내부에 있는 데이터 스트림 구현을 위한 클래스 입니다.  
**Cold Stream** 이고 `collect()` 시점에 값이 방출되어 내려옵니다.

아래 코드와 같이 Flow builder 를 사용해서 구성할 수 있습니다.

~~~kotlin
public fun <T> flow(@BuilderInference block: suspend FlowCollector<T>.() -> Unit): Flow<T> = SafeFlow(block)
~~~

~~~kotlin
val count = flow {
    emit(1)
    emit(2)
}

runBlocking {
    count.collect { num ->
        println(num)
    }
}
~~~
~~~
1
2
~~~

`LiveData` 와는 달리 단순히 데이터를 흐르게만 할 수 있고 고정하여 사용할 수 없습니다.  
실무에서 사용한다면 `LiveData` 와 같은 데이터 홀더는 별도로 구성해야 한다는 뜻 입니다.

`Flow` 에서도 데이터 홀더 역할이 가능한 `SharedFlow` 와 `StateFlow` 인터페이스를 준비해놓았습니다. 

## SharedFlow

`Flow` 를 확장한 인터페이스 입니다.  
**Hot Stream** 이며 `Flow` 의 데이터 스트림 역할은 물론 데이터를 잠시 저장하는 홀더 역할이 가능합니다.

그리고 추가로 `replay`, `extraBufferCapacity` 등의 파라미터를 지원하여 구독에 대한 정책을 설정할 수 있는 기능을 지원합니다.

```kotlin
public fun <T> MutableSharedFlow(
    replay: Int = 0,
    extraBufferCapacity: Int = 0,
    onBufferOverflow: BufferOverflow = BufferOverflow.SUSPEND
): MutableSharedFlow<T>
```

각 파라미터에 대한 설명입니다.

### replay

이전에 내보낸 여러 값을 새 구독자에게 다시 방출할 수 있습니다.

### extraBufferCapacity

설정한 수만큼 추가적인 버퍼를 생성하고 `emit()` 한 데이터를 버퍼에 적재합니다.

### onBufferOverflow

버퍼가 가득찬 경우에 아래 옵션으로 정책을 정할 수 있습니다.

- `BufferOverflow.SUSPEND`: `emit()` 이 blocking 됩니다.
- `BufferOverflow.DROP_LATEST`: 가장 최근 값을 버리고, 새로운 값으로 대체합니다.
- `BufferOverflow.DROP_OLDEST`: 가장 오래된 값을 버리고, 새로운 값으로 대체합니다.

## StateFlow

`SharedFlow` 를 확장한 인터페이스 입니다.  
**Hot Stream** 이며, 이름 그대로 구독자에게 상태 데이터를 방출하기 위한 목적으로 만들어졌습니다. 

데이터 홀더 역할을 비롯한 대부분 `SharedFlow` 와 동일하지만 몇 가지 다른 특징이 있습니다.

1. 초기값을 필요로 합니다.
2. `SharedFlow` 의 Replay Cache 가 지원되지 않습니다.
3. `emit()` 호출 시 이미 적재된 데이터의 **중복을 무시(skip)**합니다.
4. 단 하나의 데이터의 최신 상태만을 유지하고 있습니다.

## Conclusion

`LiveData` 대신 `Flow` 를 권장하는 이유는, `SharedFlow` 를 비롯한 `StateFlow` 를 사용하여 데이터 홀더의 역할도 수행이 가능하고, 방출되는 데이터를 flow 안에서 `zip()`, `map()`, `filter()` 등의 다양한 확장 함수로 가공할 수 있는 것이 참 편리하기 때문입니다.  
게다가 단점인 수명주기를 인식하지 못하는 부분도 `flowWithLifecycle()` 등의 확장 함수를 통해 보완이 가능한 이유도 있습니다.

하지만 단순 데이터 홀더 역할의 관점에서 생각하면 `LiveData` 의 사용 방식이 더욱 간편하고, 상용구 코드를 간소화 할 수 있다는 점에서는 장점이기에 상황에 따라 적절히 사용하면 좋을 것 같습니다.