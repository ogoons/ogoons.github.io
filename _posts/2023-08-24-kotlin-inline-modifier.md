---
layout: post
title: "[Kotlin] inline 수정자에 대하여 알아보기"
categories: Kotlin
---

inline 수정자와 이와 관계되는 다양한 키워드에 대해 정리해봅니다.

## inline functions

코틀린 공식 문서에 설명된 바를 요약하면 다음과 같습니다.

>고차 함수를 사용하면 특정 런타임에 패널티가 부과되며, inline 수정자를 사용하면 함수 호출부에 직접 삽입됩니다.

일반적인 함수에서 사용하는 람다식은 내부에서 함수 객체를 생성하는 비용이 발생합니다.  
이는 불필요한 오버헤드를 야기합니다.  
하지만, inline 수정자를 사용하면 함수 자체는 물론 함수에 전달된 람다식을 함수 구현 바디에 직접 삽입하여 오버헤드를 제거할 수 있습니다.

~~~kotlin
inline fun testFunc(lambda: () -> Unit) {
    lambda()
}
~~~

## noinline

inline 함수에 전달된 람다식을 inline 처리하지 않기 위해 사용할 수 있습니다.

~~~kotlin
inline fun foo(inlined: () -> Unit, noinline notInlined: () -> Unit) { ... }
~~~

## crossinline

~~~kotlin
inline fun foo(lambdaFunc: () -> Unit) {
    bar { lambdaFunc() }
}

fun bar(lambdaFunc: () -> Unit) {
    lambdaFunc()
}
~~~

예제에서는 foo() 라는 inline 함수 내부에서 전달받은 람다를 바로 소비하지 않고, bar() 라는 inline 이 아닌 다른 함수에게 전달해주는 것을 볼 수 있습니다.  
이 경우는 컴파일러에서 다음과 같은 경고를 볼 수 있습니다.

>Can't inline 'lambdaFunc' here: it may contain non-local returns. Add 'crossinline' modifier to parameter declaration 'lambdaFunc'

해석하면 비지역 반환을 허용하지 않으며, crossline 수정자를 추가해 달라는 메시지를 확인할 수 있습니다.

여기서 **비지역 반환(Non-local return)** 이란

> inline 함수에 사용된 람다식의 반환은 람다를 매개변수로 받는 인라인 함수도 함께 종료시킨다. 이를 비지역 반환(Non-local return) 이라 한다.

다시 돌아와서, 비지역 반환을 허용하기 위해 다음과 같이 crossinline 수정자를 추가해주면 해결할 수 있습니다.

~~~kotlin
inline fun foo(crossinline lambdaFunc: () -> Unit) {
    bar { lambdaFunc() }
}

fun bar(lambdaFunc: () -> Unit) {
    lambdaFunc()
}
~~~

## inline property

Backing field 가 없는 프로퍼티의 접근자에 사용할 수 있습니다.

~~~kotlin
val foo: Foo
    inline get() = Foo()

var bar: Bar
    get() = ...
    inline set(v) { ... }

inline var bar: Bar // 프로퍼티에 수정자를 달아서 두 접근자 모두 사용할 수도 있습니다.
    get() = ...
    set(v) { ... }
~~~
호출 부에서 inline 접근자는 일반 inline 함수로 전환됩니다.

## reified

제네릭 타입의 inline 함수에서만 사용 가능하며, 런타임에 타입 정보를 알고 싶은 경우에 사용합니다.

~~~kotlin
fun <T> genericFunc(value: T)
~~~

위와 같이 일반적인 제네릭 함수가 컴파일되면 컴파일러는 타입(T) 정보를 제거하며 코드가 실행되는 런타임에는 제네릭 타입이 무엇인지 알 수 없습니다.  
따라서 value 매개변수는 함수 내부에서 사용할 수 없습니다.

여기서 생각할 수 있는 솔루션은, 다음과 같이 매개변수에 타입 정보를 함께 넘겨주는 방법입니다.

~~~kotlin
fun <T> genericFunc(value: T, type: Class<T>) {
    when (type) {
        String::class.java -> {
            println(value)
        }
        Int::class.java -> {
            println(value as Int + 1)
        }
    }
}
~~~

매개변수를 하나 더 추가해야 하므로 번거롭고 별로 우아하지 않습니다.

reified 수정자를 사용하면 하나의 매개변수로 이 문제를 해결할 수 있습니다.  
inline 수정자와 반드시 함께 사용하여야 합니다.

~~~kotlin
inline fun <reified T> genericFunc(value: T) {
    when (T::class) {
        String::class -> {
            println(value)
        }
        Int::class -> {
            println(value as Int + 1)            
        }
    }
}
~~~

하나의 제네릭 타입의 매개변수를 사용하여 함수 내부에서 타입을 추론하고 사용까지 할 수 있음을 알았습니다.

#### reified 를 사용하여 함수 오버로딩

앞서 같은 방식으로 제네릭 타입의 위치를 매개변수가 아닌 반환값으로 이동하면, 다음과 같이 반환 타입이 다른 서로 다른 함수를 오버로딩하는 효과를 낼 수 있습니다.

~~~kotlin
inline fun <reified T> getData(data: Int): T {
    return when (T::class) {
        String::class -> "Data = $data" as T
        Int::class -> data as T
        else -> "Error" as T
    }
}
~~~