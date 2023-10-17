---
layout: post
title: "[Coroutine] SupervisorJob"
categories: Coroutine
---

코루틴은 내부에서 Exception 이 발생하면 부모와 자식 양방향으로 예외를 전달합니다. 그리고 나서 코루틴 계층 전체를 종료합니다.  
이러한 코루틴의 특성은 특정 자식 코루틴이나 블록에서 예외를 처리하고 Skip 하기가 곤란해지는 단점이 있습니다.

특정 자식 작업에서 예외가 발생하면 해당 블록에서 처리를 끝내고, 나머지 예약된 코루틴 작업을 이어나갈 필요가 있는 경우 어떻게 처리하면 될까요?  
아래에 해답이 있습니다.

## SupervisorJob

`SupervisorJob` 을 사용하면 **자식 코루틴에서 발생한 예외를 부모에게 전달하지 않고 자식 방향으로 한정**할 수 있습니다.  
적절한 사용 예시를 보겠습니다.

~~~kotlin
private val exceptionHandler = CoroutineExceptionHandler { coroutineContext, throwable ->
    println(throwable.message ?: "")
}

private val supervisorJob = SupervisorJob()

fun main() = runBlocking {
    val parentJob = launch(exceptionHandler) {
        val firstChildJob = launch(supervisorJob) {
            println("firstChildJob")
            throw Exception("firstChildJob - Failed")
        }
        val secondChildJob = launch {
            println("secondChildJob")
        }
        firstChildJob.join()
        secondChildJob.join()

        println("Parent job")
    }
}
~~~

위 코드의 실행 결과는 다음과 같습니다.

~~~
firstChildJob
firstChildJob - Failed
secondChildJob
Parent job
~~~

`firstChildJob` 에서 예외 발생 후, `secondChildJob` 와 부모 코루틴의 작업이 취소되지 않고 정상적으로 진행됩니다.

이러한 특성을 이용해 하나의 코루틴 내부에서 복수의 Back-end API 를 비동기 처리 후 결과를 보여줘야 하는 경우에 유용할 것입니다.
하나의 API 호출이 실패해도, 다른 호출 결과가 정상인 경우에도 결과를 보여줘야 하는 경우도 있기 때문입니다.

`SupervisorJob` 을 범위를 설정하여 적용하는 방법도 설명하겠습니다.

## supervisorScope

앞서 `SupervisorJob` 을 사용한 코드 스니펫에서 `SupervisorJob` 대신 사용하고자 하는 코루틴을 아래 예시와 같이 감싸주면 됩니다.

~~~kotlin
supervisorScope {
    launch {
        ...
    }
}
~~~

사용 예는 다음과 같습니다.

~~~kotlin
private val exceptionHandler = CoroutineExceptionHandler { coroutineContext, throwable ->
    println(thrawable.message ?: "")
}

fun main() = runBlocking {
    val parentJob = launch(exceptionHandler) {
        val firstChildJob = supervisorScope {
            launch {
                println("firstChildJob")
                throw Exception("firstChildJob - Failed")
            }
        }
        val secondChildJob = launch {
            println("secondChildJob")
        }
        firstChildJob.join()
        secondChildJob.join()

        println("Parent job")
    }
}
~~~

위 코드의 실행 결과는 다음과 같습니다.

~~~
firstChildJob
firstChildJob - Failed
secondChildJob
Parent job
~~~

SupervisorJob 을 사용한 예제와 결과가 같습니다.

`SupervisorJob`, `supervisorScope` 를 사용한 코루틴은 부모 코루틴으로 예외를 전달하지 못하기 때문에 `CoroutineExceptionHandler` 를 사용하거나 각각 자식 코루틴 내부에서 `try-catch` 로 직접 핸들링 해주어야 합니다.  

## Conclusion
정리하면 자식이 잘못한 문제에 대해서 자식 스스로 해결하라는 뜻 입니다.
