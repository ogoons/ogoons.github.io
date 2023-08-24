---
layout: post
title: "[Kotlin] inline(value) class"
categories: Kotlin
---

코틀린의 inline class 에 대해서 알아봅니다.

## inline class (value class by kotlin 1.5)

아래와 같이 사각형을 그리는 함수를 작성한다고 예를 들어봅니다.

~~~kotlin
fun drawRect(width: Int, height: Int)
~~~

어떠한 문제점이 있을까요?  

함수 호출 코드를 작성하면서 매개변수로 전달한 width, height 를 서로 바꾸어 전달하게될 여지가 있습니다.  
이러한 문제를 해결해줄 방법으로 우리는 매개변수의 타입을 Primitive 타입이 아닌 고유의 Object 로 전달하면 해결할 수 있을 겁니다.

data class 를 이용하여 Wrapping 한 솔루션은 다음과 같습니다.

~~~kotlin
data class Width(
    val value: Int
)

data class Height(
    val value: Int
)

fun drawRect(width: Width, height: Height)
~~~

매개변수의 타입을 고유의 타입으로 Wrapping 하여 비즈니스 타입에 맞게 변경하였습니다.
이로써, 함수 호출 시 개발자의 실수를 방지할 수 있습니다.

하지만, 위 코드와 같은 Wrapper 클래스를 매개변수에 사용하게 되면 Primitive 타입을 전달하는 것에 비해, 런타임에 추가 힙 할당으로 오버헤드가 발생하는 단점이 있습니다.
이런 성능적인 문제를 해결하기 위해서 나온 것이 바로 **inline class** 입니다.

## 특징

inline class 는 다음과 같은 특징을 갖습니다.

- 디폴트 생성자에는 단 하나의 immutable(val) 필드만 가질 수 있습니다.
- 필드를 추가할 수 없습니다.
- secondary 생성자를 가질 수 없습니다.
- init {} 블록을 가질 수 있습니다.
- 메소드를 가질 수 있습니다. (e.g. 계산 결과 출력 등)
- backing field 를 가질 수 없습니다.
- lateinit field 를 가질 수 없습니다.
- interface 를 상속할 수 있습니다.
- class 계층 구조에 참여하는 것은 금지되어 있습니다. (항상 final)

inline class 로 리팩터링한 코드는 다음과 같습니다.

~~~kotlin
inline class Width(
    val value: Int
)

inline class Height(
    val value: Int
)

fun drawRect(width: Width, height: Height)
~~~

## value class

코틀린 1.5부터는 inline function 과 겹치는 등 inline 키워드의 모호성으로 인해, **value class** 로 변경되었습니다.  
1.3에서는 알파, 1.4에서는 베타 버전으로 사용이 가능합니다.  
inline class 와 사용 방법은 동일하나, 달라진 특징은 아래와 같습니다.

- **@Jvminline** 어노테이션을 추가해주어 컴파일러에게 inline 하도록 지시해야 합니다.

변경된 코드는 다음과 같습니다.

~~~kotlin
@Jvminline
value class Width(
    val value: Int
)

@Jvminline
value class Height(
    val value: Int
)

fun drawRect(width: Width, height: Height)
~~~

지금까지 inline(value) class 의 사용방법을 알아보았습니다.  
간단한 값을 코드상에서 효율적으로 표현해야 하며 성능적인 면까지 고려해야 하는 경우, 아주 유용하게 사용할 수 있습니다.  

다음 포스팅에서는 inline 키워드에 대해서 다뤄보도록 하겠습니다.