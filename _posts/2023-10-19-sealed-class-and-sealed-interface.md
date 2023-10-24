---
layout: post
title: "[Kotlin] Sealed Class and Sealed Interface"
categories: Kotlin
---

코틀린의 `sealed class` 와 코틀린 1.5에서 추가된 `sealed interface` 에 대해서 알아봅니다.

## 기존 enum class 의 단점

Java 의 `enum`, Kotlin 의 `enum class` 는 내부 정의된 상수의 타입이 단일 인스턴스 하나로 한정되어 있습니다.

`UiState` 를 열거한 `enum class` 를 예를 들어보겠습니다.

~~~kotlin
enum class UiState {
    LOADING,
    SUCCESS(val data: String), // Error
    ERROR(val error: Exception) // Error
}
~~~

위 예제와 같이 상수의 타입을 별도로 정의할 수 있는 구조가 아니기 때문에, `LOADING` 과 달리 `SUCCESS`, `ERROR` 타입은 컴파일 에러가 발생합니다.

이와 같은 단점을 보완하게 위해 등장한 것이 `sealed class` 입니다.

## sealed class

`enum class` 와 기능이 유사하지만 다양한 하위 타입을 가질 수 있으며, 그 타입을 한정하여 컴파일러에게 알려주기 위한 기능을 추가적으로 가지고 있습니다.  
하위 타입은 일반 `class`, `data class`, `object`, `data object`(kotlin 1.9) 등을 가질 수 있습니다.  

위에서 `enum class` 로 정의했던 `UiState` 타입을 `sealed class` 로 변경해보겠습니다.

~~~kotlin
sealed class UiState {
    object Loading : UiState()
    data class Success(val data: String) : UiState() // OK
    data class Error(val error: Exception) : UiState() // OK
}
~~~

이런 구조로 클래스 계층을 설정하면 상위 클래스 객체에서 하위 클래스 객체의 타입을 알 수 있고, 각기 다른 타입을 설정하여 다양한 Use Case 에 대응할 수 있다는 장점이 있습니다.

제약사항으로 하위 클래스의 정의는 같은 **패키지나 파일 내부**에 기술되어야 합니다.  
상위 클래스의 기본 생성자의 가시성이 protected(default) 와 private 만 설정이 가능하기 때문입니다.

## Nested sealed class

`sealed class` 내부에 중첩하여 사용할 수도 있습니다.  
이 기능은 `UiState` 클래스 내부 `Error` 의 하위 타입을 좀 더 세분화 하여 구분할 필요가 있을 경우 적절합니다.

~~~kotlin
sealed class UiState {
    object Loading : UiState()

    data class Success(val data: String) : UiState()

    sealed class Error(open val error: Exception) : UiState() { // 중첩된 sealed class 를 사용하여 Error 를 세분화
        data class UiError(override val error: Exception) : Error(error)
        data class NetworkError(override val error: Exception) : Error(error)
    }
}
~~~

하지만 이 방식은 상위 타입인 `Error` 를 인스턴스화 할 수 없다는 단점이 있습니다.

~~~kotlin
var uiState = UiState.Error(Exception()) // Error

uiState = UiState.Error.NetworkError(Exception()) // OK
~~~

## sealed interface

`sealed interface` 는 코틀린 1.5에서 등장하였습니다.  
하나의 `sealed class` 만 상속할 수 있는 계층적 한계를 극복하기 위해서 추가되었습니다.

대표적인 예로 라이브러리에서 Error 를 모델링할 때 계층화하여 설계할 수 있습니다. ([코틀린 공식 문서](https://kotlinlang.org/docs/sealed-classes.html#location-of-direct-subclasses))

~~~kotlin
sealed interface Error

sealed class IOError(): Error

class FileReadError(val file: File): IOError()
class DatabaseError(val source: DataSource): IOError()

object RuntimeError : Error
~~~

또 다른 비슷한 사용 사례로 네트워크 통신 API에서 발생하는 Error 타입을 계층 구조로 설계하여 세분화 할 수 있습니다.

~~~kotlin
sealed interface LoginError {
    object IncorrectPasswordError : LoginError
    object UserNotFoundError : LoginError
}

sealed interface HttpError {
    object GetUserListError : HttpError
    object GetUserLikesError : HttpError
}

sealed interface CommonError : LoginError, HttpError {
    object ServerError : CommonError
    object FileReadError : CommonError
}

private fun handleLoginError(loginError: LoginError) {
    when (loginError) {
        CommonError.FileReadError -> TODO()
        CommonError.ServerError -> TODO()
        LoginError.IncorrectPasswordError -> TODO()
        LoginError.UserNotFoundError -> TODO()
    }
}

private fun handleHttpError(httpError: HttpError) {
    when (httpError) {
        CommonError.FileReadError -> TODO()
        CommonError.ServerError -> TODO()
        HttpError.GetUserLikesError -> TODO()
        HttpError.GetUserListError -> TODO()
    }
}

private fun handleCommonError(commonError: CommonError) {
    when (commonError) {
        CommonError.FileReadError -> TODO()
        CommonError.ServerError -> TODO()
    }
}
~~~

말 그대로 인터페이스이기 때문에 다중 상속을 통한 타입의 다형성을 부여할 수 있습니다.  
다시 말해, 특정 타입의 성질을 하위 타입에게 전달하기가 쉽습니다.  
또한, `when` 문을 사용하여 타입을 참조하여 분기해야할 상황에서 장점이 명확해지는 것을 위 코드를 통해 확인할 수 있습니다.