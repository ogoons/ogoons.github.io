---
layout: post
title: "[Coroutine] SupervisorJob"
categories: Coroutine
---

코루틴은 내부에서 Exception 이 발생하면 부모와 자식 양방향으로 예외를 전달합니다. 그리고 나서 코루틴 계층 전체를 종료합니다. 이러한 코루틴의 특성은 특정 자식 코루틴이나 블록에서 예외를 처리하고 Skip 하기가 곤란해지는 단점이 있습니다.

특정 작업에서 예외가 발생하면 해당 블록에서만 처리해주고 나머지 코루틴 작업을 이어나갈 필요가 있는 경우 어떻게 처리하면 될까요?

## SupervisorJob

하위(자식) 방향으로 취소를 전파하기 위한 Coroutine Job 입니다.
만약 해당 코루틴을 cancel() 을 호출하여 취소한 경우 하위 자식 코루틴도 모두 종료가 됩니다. 

~~~kotlin
private val exceptionHandler = CoroutineExceptionHandler { coroutineContext, throwable ->
    Log.d("ogoons", throwable.message ?: "")
}

private val supervisorJob = SupervisorJob()

fun main() = runBlocking {
    launch(exceptionHandler) {
        val childJob1 = launch(supervisorJob) {
            Log.d("ogoons", "Child job 1")
            throw Exception("Child job 1 - Failed")
        }
        val childJob2 = launch {
            Log.d("ogoons", "Child job 2")
        }
        childJob1.join()
        childJob2.join()

        Log.d("ogoons", "Parent job")
    }
}
~~~

위 코드의 실행 결과는 다음과 같습니다.

~~~
Child job 1
Child job 1 - Failed
Child job 2
Parent job
~~~

Child job 1 에서 예외 발생 후, Child job 2 와 부모 코루틴의 작업이 취소되지 않고 정상적으로 진행됩니다.

이러한 특성은 하나의 코루틴 내부에서 복수의 Back-End API 를 호출하여 결과를 보여줘야 하는 경우에 유용할 것입니다.
하나의 API 호출이 실패해도, 다른 호출 결과가 정상인 경우에도 결과를 보여줘야 하는 경우도 있기 때문입니다.

SupervisorJob 을 범위를 설정하여 적용하는 방법도 설명하겠습니다.

## supervisorScope

앞서 SupervisorJob 을 사용한 코드 스니펫에서 SupervisorJob 대신 사용하고자 하는 코루틴을 아래 예시와 같이 감싸주면 됩니다.

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
    Log.d("ogoons", throwable.message ?: "")
}

fun main() = runBlocking {
    launch(exceptionHandler) {
        val childJob1 = supervisorScope {
            launch {
                Log.d("ogoons", "Child job 1")
                throw Exception("Child job 1 - Failed")
            }
        }
        val childJob2 = launch {
            Log.d("ogoons", "Child job 2")
        }
        childJob1.join()
        childJob2.join()

        Log.d("ogoons", "Parent job")
    }
}
~~~

위 코드의 실행 결과는 다음과 같습니다.

~~~
Child job 1
Child job 1 - Failed
Child job 2
Parent job
~~~

SupervisorJob 을 사용한 예제와 결과가 같습니다.

SupervisorJob, supervisorScope 를 사용한 코루틴은 부모 코루틴으로 예외를 전달하지 못하기 때문에 CoroutineExceptionHandler 를 사용하거나 각각 자식 코루틴 내부에서 try-catch 로 직접 핸들링 해주어야 합니다.
그렇지 않으면 예외를 받아줄 곳이 없어 프로그램이 종료되어 버릴 겁니다.
