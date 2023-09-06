---
layout: post
title: "[Kotlin] Generics 파헤치기 Part 2 - 변성(Variance)과 in, out 한정자"
categories: Kotlin
---

코틀린의 제네릭 프로그래밍 방식에 대해서 파헤쳐보기 두 번째 시간입니다.

## 변성 그리고 Variance 한정자

**변성**이란, **기저타입(Base Type)**이 같고 **타입 아규먼트(Type Argument)** 가 다른 경우에 대한 관계를 설명하는 개념입니다.

~~~kotlin
List<Any>
List<String>
~~~

여기서 List 는 기저타입, Any 와 String 은 타입 아규먼트가 됩니다.  
코틀린은 이 두 개의 타입에 대한 관계를 설정할 수 있는 강력한 제네릭 기능을 제공합니다.

관련 용어로는 **공변성, 반공변성, 무공변성**이 있습니다.  
아래에서 더 자세히 다루어 보겠습니다.

## 무공변성 (Invariance)

~~~kotlin
class Cup<T>(private var liquid: T) {
    fun setLiquid(value: T) { // OK
        this.liquid = value
    }
    fun getLiquid(): T { // OK
        return liquid
    }
}

val a1 = Cup<Water>(Water())
val b1: Cup<Liquid> = a1 // 오류

val a2 = Cup<Liquid>(Liquid())
val b2: Cup<Water> = a2 // 오류
~~~

무공변성은 두 클래스간에 아무런 관계가 설정되지 않은 성질을 말합니다.  
위 코드와 같이 **Cup`<Water>`** 와 **Cup`<Liquid>`** 는 상하위 관계가 존재하지 않으므로, 서로에게 할당하는 코드에서 타입 불일치 오류가 발생합니다.  

- 별도의 키워드 지정 없음
- **Cup`<Water>`** 와 **Cup`<Liquid>`** 는 아무런 관계가 없다.
- **T** 를 생산자 위치 또는 소비자 위치 모두에서 사용 가능

## 공변성 (Covariance)

~~~kotlin
class Cup<out T>(private val liquid: T) {  // out 한정자를 사용하여 공변성으로 만듬
    fun setLiquid(value: T) { // 오류
        this.value = value
    }

    fun getLiquid(): T { // OK, out 위치에서 타입 매개변수 사용
        return liquid
    }
}
open class Liquid // B
class Water : Liquid() // A

val a = Cup<Water>(Water())
val b: Cup<Liquid> = a // OK
~~~

**Water** 가 **Liquid**의 하위 타입이고, 마찬가지로 **Cup`<Water>`** 가 **Cup`<Liquid>`** 의 하위 타입인 경우에는 **공변성**을 갖는다 할 수 있습니다.  

**out** 키워드를 사용하여 타입 매개변수를 생산자 역할로만 사용하도록 한정할 수 있습니다.

여기서 **a** 객체는 상위 타입인 **b** 객체에 할당이 가능합니다.  
**out** 한정자를 통해 **Cup`<Water>`** 는 **Cup`<Liquid>`** 의 하위 타입으로 설정되어, 묵시적으로 업캐스팅이 이루어졌기 때문입니다.  

- **out** 키워드를 사용
- **Water** 는 **Liquid** 의 하위 타입이다.
- **Cup`<Water>`** 는 **Cup`<Liquid>`** 의 하위 타입이다.
- **T** 를 생산하는 위치에만 사용하도록 제한 (함수의 반환 타입)

추가로, 위 코드에서는 타입 매개변수 **T** 를 **out** 한정자로 설정해놓았습니다.  
그리고 **setLiquid() 함수의 value 매개변수**가 public **in** 한정자의 위치에 해당되어, 컴파일러가 오류를 발생시킵니다.  

## 반공변성 (Contravariance)

공변성에 반대되는 개념입니다.  

~~~kotlin
class Cup<in T>(private val liquid: T) { // in 한정자를 사용하여 반공변성으로 만듬
    fun setLiquid(value: T) { // OK, in 위치에서 타입 매개변수 사용
        this.value = value
    }

    fun getLiquid(): T { // 오류
        return liquid
    }
}

open class Liquid
class Water : Liquid()

val a1 = Cup<Water>(Water())
val b1: Cup<Liquid> = a1 // 오류

val a2 = Cup<Liquid>(Liquid())
val b2: Cup<Water> = a2 // OK
~~~

**Liquid** 는 **Water** 의 상위 타입이지만 **Cup`<Liquid>`** 는 **Cup`<Water>`** 의 하위 타입인 경우와 같이 반대되는 경우를 반공변성을 갖는다 할 수 있습니다.  

이와 같은 성질은 **in** 한정자의 타입 매개변수를 사용하여 제네릭 클래스를 소비자의 역할로만 사용하도록 제한할 수 있습니다.  

out 한정자를 사용할 때와는 다르게 T 를 매개변수로 받는 **setLiquid()** 함수의 **value** 매개변수에서 오류가 발생하지 않습니다.  
반대로 T 를 반환하는 생산자 위치의 **getLiquid()** 함수에서는 오류가 발생하는 것을 확인할 수 있습니다.

- **in** 키워드를 사용
- **Water** 는 **Liquid** 의 하위 타입이다.
- **Cup`<Liquid>`** 는 **Cup`<Water>`** 의 하위 타입이다.
- **T** 를 소비하는 위치에만 사용하도록 제한 (함수의 매개변수)