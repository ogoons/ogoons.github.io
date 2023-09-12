---
layout: post
title: "[Kotlin] Generics 파헤치기 Part 1 - 정의, 타입 매개변수 제약"
categories: Kotlin
---

코틀린의 제네릭 프로그래밍 방식에 대해서 파헤쳐보기 첫 번째 시간입니다.

## Generics 이란 무엇일까?

다른 객체지향 프로그래밍 언어와 마찬가지로 코틀린만의 특색있는 제네릭 프로그래밍을 지원하고 있습니다.  
제네릭을 한국어로 해석하면 일반적인, 포괄적인 뜻을 함유하고 있습니다.  
프로그래밍에서의 제네릭은 프로그래머가 클래스에서 사용하는 타입을 특정하지 않고 로직을 재사용하여 결과를 도출하는 방식의 프로그래밍이라 할 수 있습니다.

~~~kotlin
class School<T> {
    private val students = mutableListOf<T>()

    fun addStudent(student: T) {
        students.add(student)
    }
}
~~~

여기서 `<T>` 로 명시된 타입을 타입 매개변수(Type Parameter)라고 합니다.

~~~kotlin
fun main() {
    val school = School<Student>()
    school.addStudent(Student())
}
~~~

외부에서 클래스를 사용할 때 꺽쇠괄호 `<>` 안에 타입(Student)을 지정해서 타입 매개변수에 전달했는데, 이를 타입 아규먼트(Type Argument)라고 합니다.


## 타입 매개변수의 관례

타입 매개변수로 사용하는 명명규칙(Naming Convention)은 다음과 같습니다.  

|타입|설명|
|---|---|
|`<T>`|Type|
|`<E>`|Element|
|`<K>`|Key|
|`<V>`|Value|
|`<N>`|Number|

다만, 의무가 아닌 관례일 뿐이라 꼭 대문자나 한 글자가 아니어도 되고, 프로젝트 성격에 맞는 다른 이름을 지정해서 구분하는 것도 좋은 방법입니다.

## 다양한 제네릭 프로그래밍 방식

일반 클래스 외에 `data class`, `abstract class`, `sealed class`, `interface`, 그리고 **함수**나 **확장된 프로퍼티**에도 제네릭하게 사용할 수 있습니다.  
(`enum class` 는 지원하지 않습니다.)

아래는 함수에서의 사용방법입니다.

~~~kotlin
fun <T> getStudent(student: T) : T {
    return student
}
~~~

프로퍼티는 확장된 프로퍼티에서만 제네릭하게 사용할 수 있습니다.

~~~kotlin
val <T> School<T>.credit: Int
    get() = 10
~~~


## 타입 매개변수 제약 (Type Parameter Constraint)

타입 매개변수의 상한 타입에 제한을 둘 수 있습니다.  
타입 매개변수 뒤에 콜론(:)을 붙인 후 상한 타입을 기입해주면 됩니다.

~~~kotlin
class School<T : Student> {
    private val students = mutableListOf<T>()

    fun addStudent(student: T) {
        students.add(student)
    }
}
~~~

이제 타입 매개변수 `T` 는 `Student` 를 상위 클래스로 하는 타입 아규먼트만 받을 수 있습니다.

`where` 키워드를 사용하면 타입 매개변수를 하나는 물론 여러 개 지정하는 것도 가능합니다.

다음은 사용사례 별로 타입 매개변수 제약을 하나 또는 여러 개 지정한 예제입니다.

~~~kotlin
interface Human

interface Student : Human

interface Teacher

interface Boy

interface Girl

interface School<T : Student> {
    fun addStudent(student: T)
}
~~~

#### 클래스의 타입 매개변수 제약

~~~kotlin
// 1개의 타입 제약
class HighSchool<T : Student> : School<T> {

    private val students = mutableListOf<T>()

    override fun addStudent(student: T) {
        students.add(student)
    }
}

// 2개 이상의 타입 제약
class BoysSchool<T> : School<T> where T : Student, T : Boy {

    private val students = mutableListOf<T>()

    override fun addStudent(student: T) {
        students.add(student)
    }
}
~~~


#### 함수의 타입 매개변수 제약

~~~kotlin
// 1개의 타입 제약
fun <T : Student> getStudent(student: T) : T {
    return student
}

// 2개 이상의 타입 제약
fun <T> getBoyStudent(student: T) : T where T : Student, T : Boy {
    return student
}

~~~

#### 확장된 프로퍼티의 타입 매개변수 제약

~~~kotlin
// 1개의 타입 제약
val <T : Student> School<T>.credit: Int
    get() = 10

// 2개 이상의 타입 제약
val <T> School<T>.age: Int where T: Student, T : Boy
    get() = 15
~~~

다음 포스팅에서는 코틀린 제네릭의 변성(Variance)을 비롯한 in, out 등의 관련 키워드도 같이 다루어 보겠습니다.