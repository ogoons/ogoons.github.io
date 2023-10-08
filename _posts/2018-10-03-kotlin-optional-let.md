---
layout: post
title: "[Kotlin] optional + let을 통한 null 체크"
categories: Kotlin
---

우리는 보통 null 체크하는 로직을 아래와 같이 구현합니다.

```kotlin
fun letNullCheck(arg: String?) {
    if (arg != null) {
        Log.d("TEST", "if NotNull arg = ${it}")
    } else {
        Log.d("TEST", "if Null arg = ${it}")
    }
}
```

좀 더 코틀린스럽게 작성한다면 `let` 과 elvis operator를 추가하여 아래와 같이 사용할 수 있습니다.

```kotlin
fun letNullCheck(arg: String?) {
    arg?.let { Log.d("TEST", "if NotNull arg = ${it}") } ?: Log.d("TEST", "if Null arg = ${it}")
}
```

잘 동작합니다.
하지만 elvis 연산자 뒤에는 중괄호를 포함할 수 없기에 솔루션을 검색해보니 아래와 같은 코드를 구현한 포스팅을 찾을 수 있었는데요.

```kotlin
fun letNullCheck(arg: String?) {
    arg?.let {
        Log.d("TEST", "if NotNull arg = ${it}")
    }.let {
        Log.d("TEST", "if Null arg = ${it}")
    }
}
```

하지만 위와 같은 코드는 이해하기에도 어렵고, 지극히 극단적인 코드입니다.

그리고 **arg가 Null 인 경우는 문제가 없지만 NotNull인 경우 NotNull인 경우의 구문과 Null 구문까지 모두 실행해 버립니다.**

이런 경우는 다음과 같이 elvis 연산자 뒤에 `let` 을 붙여줌으로써 구현이 가능합니다.

```kotlin
fun letNullCheck(arg: String?) {
    arg?.let {
        Log.d("TEST", "if NotNull arg = ${it}")
    } ?: let {
        Log.d("TEST", "if Null arg = ${it}")
    }
}
```

하지만 배보다 배꼽이 더 커졌네요.  
원래 사용하던 `if (arg != null)` 이 가독성면에서 더 좋아보입니다.  

## Conclusion

무엇이든지 극단적인 것은 좋지 않습니다.
