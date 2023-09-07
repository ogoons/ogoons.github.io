---
layout: post
title: "[Coroutine] 코루틴의 Continuation 과 동작 원리"
categories: Coroutine
---

코루틴의 Continuation 은 무엇이며 suspend 함수는 내부적으로 어떻게 동작하는 지 알아보자

## Continuation Passing Style

코틀린 코드와 마찬가지도 코루틴 코드도 내부적으로 JVM 기반의 바이트코드로 변환되어 작동합니다.  
그렇다면 Callback 을 사용하지 않았는데도 불구하고, 코루틴의 비동기 루틴은 어떻게 작업을 순차적으로 처리할까요?

다음은 [KotlinConf 2017 — Deep Dive into Coroutines on JVM](https://youtu.be/YrrUCSi72E8?si=PztyuDV5nLI156P4) 에 소개된 예제입니다.

~~~kotlin
suspend fun postItem(item: Item) {
    val token = requestToken()
    val post = createPost(token, tiem)
    processPost(post)
}
~~~

하나의 suspend 함수 내부에서 3개의 하위 루틴을 호출하고 있습니다.  
코루틴은 이 코드를 내부적으로 Continuation Passing Style 로 변환해서 사용하고 있습니다.

코드는 다음과 같습니다.

~~~kotlin
fun postItem(item: Item, cont: Continuation) {
    val sm = cont as? ThisSM ?: object : ThisSM { // State machine
        fun resume() {
            postItem(null, this)
        }
    }

    switch(sm.label) {
        case 0:
            // Save state
            sm.item = item
            sm.label = 1

            // Continue
            val token = requestToken(sm)
        case 1:
            // Restore state
            val item = sm.item
            val token = sm.result as Token

            // Continue
            sm.label = 2
            val post = createPost(token, item, sm)
        ...
    }
}
~~~

중간에 **State Machine** 인 **sm** 객체를 통해서 연산된 결과를 현재 label 에 해당하는 하위 함수를 호출하고 전달하며 호출이 끝나면 다시 **resume()** 의 호출을 통해 **postItem()** 을 재귀호출하고, 다음 label 의 하위 함수를 호출하는 식으로 하나의 함수 내부에서 연속성을 발생시키고 있는 것을 볼 수 있습니다.

이러한 방식을 Continuation Passing Style (CPS) 라고 합니다.

[안드로이드 공식 문서](https://developer.android.com/kotlin/coroutines/coroutines-adv)에서는 다음과 같이 설명하고 있습니다.

>Kotlin은 스택 프레임을 사용하여 로컬 변수와 함께 실행되는 함수를 관리합니다. 코루틴을 일시 중단하면 현재 스택 프레임이 복사되어 나중에 저장됩니다. 다시 시작하면 스택 프레임이 저장된 위치에서 다시 복사되고 함수가 다시 실행되기 시작합니다. 코드가 일반적인 순차 차단 요청처럼 보일지라도 코루틴은 네트워크 요청이 기본 스레드 차단을 방지하도록 보장합니다.

여기서 스택 프레임은 **State Machine** 과 같은 개념입니다.

정리하면 함수의 호출 결과를 호출자에게 직접 넘기는 것이 아니라 **Continuation** 객체와 같은 **State Machine** 에게 넘기는 동시에 호출 순서를 관리하고, 하위 함수를 순차적으로 호출하는 방식이라고 할 수 있겠습니다.

## Continuation 의 명시적인 사용

~~~kotlin
public interface Continuation<in T> {
    /**
     * The context of the coroutine that corresponds to this continuation.
     */
    public val context: CoroutineContext

    /**
     * Resumes the execution of the corresponding coroutine passing a successful or failed [result] as the
     * return value of the last suspension point.
     */
    public fun resumeWith(result: Result<T>)
}
~~~

일반적으로 Continuation 을 명시적으로 사용할 일이 많지 않을 겁니다.  
하지만 안드로이드에서 **Continuation** 을 명시적으로 사용하고, Callback 루틴을 감싸 코루틴 내부에서 간편하게 사용할 수 있는 몇 가지 예시가 있습니다.

### View#setOnClickListener

~~~kotlin
suspend fun syncClick(): String = suspendCoroutine { cont ->
    btnEnter.setOnClickListener {
        cont.resumeWith(Result.success("Clicked"))
        btnEnter.setOnClickListener(null) // 빠르고 반복적인 클릭 작업에 대응
    }
}

lifecycleScope.launch {
    val result = syncClick()
    result // Clicked
}
~~~

클릭 리스너를 **suspendCoroutine** 으로 감싸 코루틴 내부에서 간결하고 순차적인 표현이 가능해집니다.

Continuation 의 확장 함수를 이용하면, Callback 루틴 내부에서 실패가 발생해도 취소가 가능한 방법이 있습니다.

~~~kotlin
public inline fun <T> Continuation<T>.resume(value: T): Unit = 
    resumeWith(Result.success(value))

public inline fun <T> Continuation<T>.resumeWithException(exception: Throwable): Unit = 
    resumeWith(Result.failure(exception))
~~~

이 함수들은 아래 Chris Banes 의 예제를 보면 suspendCancellableCoroutine 를 사용하여 구현이 가능합니다.

### View#OnLayoutChangeListener (Chris Banes example)

~~~kotlin
suspend fun View.awaitNextLayout() = suspendCancellableCoroutine<Unit> { cont ->
    // This lambda is invoked immediately, allowing us to create
    // a callback/listener

    val listener = object : View.OnLayoutChangeListener {
        override fun onLayoutChange(...) {
            // The next layout has happened!
            // First remove the listener to not leak the coroutine
            view?.removeOnLayoutChangeListener(this)
            // Finally resume the continuation, and
            // wake the coroutine up
            cont.resume(Unit)
        }
    }
    // If the coroutine is cancelled, remove the listener
    cont.invokeOnCancellation { removeOnLayoutChangeListener(listener) }
    // And finally add the listener to view
    addOnLayoutChangeListener(listener)

    // The coroutine will now be suspended. It will only be resumed
    // when calling cont.resume() in the listener above
}

viewLifecycleOwner.lifecycleScope.launch {

    titleView.awaitNextLayout()

    // 여기서 뷰의 크기가 확정이 되면 작업을 수행...
}
~~~

뷰의 크기 확정 시점을 알기 위한 콜백 루틴을 **suspendCancellableCoroutine** 으로 감싸서 간결해졌고, 이는 호출부에서 가독성을 증대시킬 수 있습니다.
