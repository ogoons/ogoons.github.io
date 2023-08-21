---
layout: post
title: "[Kotlin] 함수형 프로그래밍"
categories: Kotlin
---

코틀린의 함수형 프로그래밍 문법을 기록하고자 글을 작성합니다.

## 일급 함수 (First Class Function)

>객체처럼 취급되는 함수를 의미한다.

아래 예제코드는 "Hello, World" 를 콘솔에 출력하기 위함 입니다.

**함수를 특정 변수에 할당할 수 있습니다.**

~~~kotlin
fun main() {
    val helloWorld: () -> String = { "Hello, World" }

    println(helloWorld())
}
~~~

**함수를 매개변수로 전달할 수 있습니다.**

~~~kotlin
fun printlnEx(func: () -> String) {
    val text = func()
    println(text)
}


fun main() {
    val helloWorld: () -> String = { "Hello, World" }

    printlnEx(helloWorld)
}
~~~

**함수의 반환값으로 함수를 전달할 수 있습니다.**

~~~kotlin
fun getHelloWorld(): () -> String {
    return { "Hello, World" }
}

fun main() {
    val helloWorld: () -> String = getHelloWorld()
    
    println(helloWorld())
}
~~~

## 고차 함수 (High Order Function)

>고차함수란 함수를 매개변수로 사용하거나 함수를 반환하는 함수입니다.

아래 2가지 유형 중에 하나라도 해당되는 함수이면 고차함수입니다.

- 함수를 매개변수로 받는다.
- 함수를 반환한다.

앞서 다룬, 일급 함수의 교집합이라고 보면 됩니다.

일급함수의 예제와 같으므로 생략하겠습니다.

## 람다식 (Lambda Expression)

>코드 블럭을 다른 함수에 넘길 수 있는 표현식을 말합니다.

아래 예제는 변수에 람다를 할당하는 예제입니다.

~~~kotlin
fun main() {
    val sum: (Int, Int) -> Int = { x: Int, y: Int -> // 함수 리터럴 (타입 생략 가능)
        x + y // 반환 값
    }
}
~~~

그리고, 아래 예제와 같이 람다의 입력 변수 타입을 생략하고 함수 리터럴과 마지막 라인에서 반환값을 명시하여 간결하게 사용이 가능합니다.  
이와 경우는 입력 변수 타입을 함수 리터럴 구문에서 추론이 가능하기 때문입니다.
~~~kotlin
fun main() {
    val sum = { x: Int, y: Int -> // (Int, Int) -> Int 생략
        x + y 
    }
    println(sum(1, 2))
}
~~~
**결과**
~~~kotlin
3
~~~

람다식을 사용한 함수를 호출할 때 아래와 같이 간결하게 코드를 작성할 수 있는 4가지 규칙을 설명합니다.

1. 마지막 매개변수가 람다식이라면 해당 람다식을 괄호 밖에서 표현할 수 있습니다.  

2. 유일한 매개변수가 람다식이라면 빈괄호 "()" 를 생략할 수 있습니다.

3. 매개변수의 타입을 컴파일러가 추론할 수 있는 경우 생략할 수 있습니다.

4. 람다의 매개변수가 유일하고 타입을 추론할 수 있는 경우 "it" 으로 접근하여 사용할 수 있습니다.

**예제**
~~~kotlin
fun printHelloWorld(func: (String) -> String) {
    val text = func("Hello, World")
    println(text)
}

fun main() {
    printHelloWorld({ text: String -> "New $text" }) // 기존

    printHelloWorld { text: String -> "New $text" } // 1, 2번 규칙 적용

    printHelloWorld { text -> "New $text" } // 1, 2, 3번 규칙 적용

    printHelloWorld { "New $it" } // 1, 2, 3, 4번 규칙 적용
}
~~~
**결과**
~~~kotlin
New Hello, World
~~~

점점 간결해 지는 코드를 확인할 수 있습니다.

## Conclusion
우리는 함수형 프로그래밍의 다양한 기능을 잘 활용하여, 추상화의 수준을 한 단계 더 끌어올릴 수 있습니다.
