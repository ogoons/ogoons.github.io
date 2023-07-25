---
layout: post
title: "[Coroutine] CoroutineName 을 활용한 디버깅"
categories: Coroutine
---

코루틴을 활용한 비동기 프로그래밍을 하다보면, 현재 실행 중인 코루틴의 이름을 알고 싶은 경우가 있습니다.

## CoroutineName
![CouroutineName Hierarchy]({{ site.url }}/assets/images/bio-photo-keyboard.jpg)

CoroutineName 의 최상위 부모는 CoroutineContext 이므로 코루틴을 시작하거나 CouroutineScope 를 생성할 때 자유롭게 첨부가 가능합니다.

~~~kotlin
val myScope = CoroutineScope(EmptyCoroutineContext)

fun main() {
    myScope.launch(CoroutineName("my_coroutine")) {
        println(coroutineContext[CoroutineName.Key]?.name)
    }
}
~~~



~~~kotlin
val myScope = CoroutineScope(EmptyCoroutineContext + CoroutineName("my_coroutine"))

fun main() {
    myScope.launch {
        println(coroutineContext[CoroutineName.Key]?.name)
    }
}
~~~

위 코드의 실행 결과는 다음과 같습니다.

~~~
I/System.out: my_coroutine
~~~

현재 코루틴의 이름을 로그로 출력하여 디버깅이 가능합니다.