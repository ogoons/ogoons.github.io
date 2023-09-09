---
layout: post
title: "[Coroutine] 코루틴 동시성(Concurrency) 제어"
categories: Coroutine
---

코루틴만의 동시성 제어 방식에 대하여 살펴봅니다.

## 스레드에서의 일반적인 임계구역 설정

~~~kotlin
runBlocking {
    @Synchronized
    fun criticalSection() {
        println("Start")
        Thread.sleep(10)
        println("End")
    }

    repeat(2) {
        thread {
            criticalSection()
        }
    }
}
~~~

아래와 같이 우리는 2개의 스레드를 실행하여 Start, End 가 순서대로 표현되길 기대합니다.

~~~
Start
End
Start
End
~~~

## 코루틴에서는?

스레드를 코루틴으로 변경한다고 가정해보겠습니다.

~~~kotlin
runBlocking {
    @Synchronized // 오류
    suspend fun criticalSection() {     
        println("Start")
        delay(10)
        println("End")
    }

    repeat(2) {
        CoroutineScope(Dispaters.Default).launch {
            criticalSection()
        }
    }
}
~~~

@Synchronized 어노테이션을 추가한 함수는 suspend 함수로 사용이 금지되어 있어, 코루틴과 호환되지 않음을 직감적으로 알 수 있습니다.

사실 이렇게 금지해놓은 것은, 일반적인 스레드와는 달리 CPS 작동 방식과 스레드를 잘개 쪼개서 사용하는 코루틴의 특징적인 이유도 있을 것 입니다.

## Race Condition 상황과 synchronized 블록

~~~kotlin
runBlocking {
    var count = 0

    val increaseJob = CoroutineScope(Dispatchers.Default).launch { // A
        repeat(10000) {
            synchronized(this) { // 효과 없음
                count++
            }
        }
    }


    val decreaseJob = CoroutineScope(Dispatchers.Default).launch { // B
        repeat(10000) {
            synchronized(this) { // 효과 없음
                count--
            }
        }
    }

    increaseJob.join()
    decreaseJob.join()

    println("Completed: $count")
}
~~~

하나의 자원(count)을 접근하는 두 개의 코루틴이 있다고 가정해봅시다.  
A 코루틴에서는 count 를 10000 회 증가, B 코루틴에서는 count 를 10000 회 감소 시킵니다.  
우리는 최종 count 결과 값으로 **0**이 나올 것을 기대하지만 결과는 실행할 때마다 달라집니다.

~~~
Completed: 570
~~~

**synchronized 블록**으로 처리했음에도 불구하고 임계영역 설정은 효과가 없습니다.

## Mutex

코루틴에서의 임계영역 설정은 **Mutex** 를 사용하면 목적을 달성할 수 있습니다.  
Mutex 가 코루틴 패키지 내에 존재하는 것도 의도된 부분입니다.

~~~kotlin
runBlocking {
    val mutex = Mutex()

    suspend fun criticalSection() = mutex.withLock {
        println("Start")
        delay(10)
        println("End")
    }

    repeat(2) {
        CoroutineScope(Dispatchers.Default).launch {
            criticalSection()
        }
    }
}
~~~

## 다른 방법은 없을까?

- newSingleThreadContext() 를 사용, 코루틴에서 사용하는 스레드를 하나로 제한하여 공유 자원에 대한 접근을 단순화 시키는 방법
- AtomicXXX 와 같은 클래스를 사용하여 스레드로 부터 안전하게 자원의 원자성을 유지하는 방법
- ~~@Volatile 변수를 사용하는 방법~~ (제대로 동작하지 않음)