---
layout: post
title: "[Kotlin] Collection Functions"
categories: Kotlin
---

코틀린 컬렉션 확장 함수들을 알아봅니다. 필드에서 생각보다 많이 사용하므로 숙지해놓으면 좋습니다.

## filter

특정 조건을 만족하는 컬렉션을 반환합니다.  
조건에 만족하는 결과만 가져오는 것이므로 컬렉션의 크기가 달라질 수 있습니다.

~~~kotlin
val cars = listOf(
    Car("Malibu", "Chevrolet", "Sedan"),
    Car("Seltos", "Kia", "SUV"),
    Car("Sonata", "Hyundai", "Sedan"),
    Car("Palisade", "Hyundai", "SUV"),
    Car("Torres", "KG-Mobility", "SUV"),
    Car("K5", "Kia", "Sedan")
)

val group = cars.filter { it.type == "Sedan" }
println(group)
~~~

### 결과

`type` 이 `"Sedan"` 과 일치하는 결과만 컬렉션으로 반환합니다.

~~~kotlin
[
    Car(name=Malibu, brand=Chevrolet, type=Sedan), 
    Car(name=Sonata, brand=Hyundai, type=Sedan), 
    Car(name=K5, brand=Kia, type=Sedan)
]
~~~

## map

컬렉션 내 데이터에 특정 연산을 추가하거나 가공하여 새 데이터의 컬렉션으로 변환하여 반환합니다.  
`filter` 와 다르게 컬렉션의 크기를 유지합니다.  
데이터를 형변환할 때 사용하면 유용합니다.

~~~kotlin
val cars = listOf(
    Car("Malibu", "Chevrolet", "Sedan"),
    Car("Seltos", "Kia", "SUV"),
    Car("Sonata", "Hyundai", "Sedan"),
    Car("Palisade", "Hyundai", "SUV"),
    Car("Torres", "KG-Mobility", "SUV"),
    Car("K5", "Kia", "Sedan")
)

val group = cars.map { Car(it.name.uppercase(), it.brand, it.type ) }
println(group)
~~~

### 결과

자동차의 이름을 전부 대문자로 변환한 연산을 추가한 콜렉션이 반환된 것을 확인할 수 있습니다.

~~~
[
    Car(name=MALIBU, brand=Chevrolet, type=Sedan), 
    Car(name=SELTOS, brand=Kia, type=SUV), 
    Car(name=SONATA, brand=Hyundai, type=Sedan), 
    Car(name=PALISADE, brand=Hyundai, type=SUV), 
    Car(name=TORRES, brand=KG-Mobility, type=SUV), 
    Car(name=K5, brand=Kia, type=Sedan)
]
~~~

## distinct

설정한 항목과 중복되는 항목을 제외한 컬렉션을 반환합니다.

~~~kotlin
fun main() {
    val cars = listOf(
        Car("Malibu", "Chevrolet", "Sedan"),
        Car("Seltos", "Kia", "SUV"),
        Car("Sonata", "Hyundai", "Sedan"),
        Car("Palisade", "Hyundai", "SUV"),
        Car("Torres", "KG-Mobility", "SUV"),
        Car("K5", "Kia", "Sedan")
    )

    val group = cars.distinctBy { it.brand }
    println(group)
}

data class Car(
    val name: String,
    val brand: String,
    val type: String
)
~~~

### 결과

~~~
[
    Car(name=Malibu, brand=Chevrolet, type=Sedan), 
    Car(name=Seltos, brand=Kia, type=SUV), 
    Car(name=Sonata, brand=Hyundai, type=Sedan), 
    Car(name=Torres, brand=KG-Mobility, type=SUV)
]
~~~

중복되는 `brand` 를 제외한 첫 번째 항목만 남은 컬렉션을 보여줍니다.

## groupBy

설정한 항목을 키로 하여 그룹핑된 `Map` 을 반환합니다.

~~~kotlin
fun main() {
    val cars = listOf(
        Car("Malibu", "Chevrolet", "Sedan"),
        Car("Seltos", "Kia", "SUV"),
        Car("Sonata", "Hyundai", "Sedan"),
        Car("Palisade", "Hyundai", "SUV"),
        Car("Torres", "KG-Mobility", "SUV"),
        Car("K5", "Kia", "Sedan")
    )

    val group = cars.groupBy { it.brand }
    println(group)
}

data class Car(
    val name: String,
    val brand: String,
    val type: String
)
~~~

### 결과

아래와 같이 `brand` 항목을 기준으로 그룹핑하여 `Map` 을 반환합니다.

~~~
[
    Chevrolet=[Car(name=Malibu, brand=Chevrolet, type=Sedan)], 
    Kia=[Car(name=Seltos, brand=Kia, type=SUV), Car(name=K5, brand=Kia, type=Sedan)], 
    Hyundai=[Car(name=Sonata, brand=Hyundai, type=Sedan), Car(name=Palisade, brand=Hyundai, type=SUV)],
    KG-Mobility=[Car(name=Torres, brand=KG-Mobility, type=SUV)]
]
~~~

## associateBy

선택한 항목을 키로 설정하여 Map 을 구성해줍니다.

~~~kotlin
fun main() {
    val cars = listOf(
        Car("Malibu", "Chevrolet", "Sedan"),
        Car("Seltos", "Kia", "SUV"),
        Car("Sonata", "Hyundai", "Sedan"),
        Car("Palisade", "Hyundai", "SUV"),
        Car("Torres", "KG-Mobility", "SUV"),
        Car("K5", "Kia", "Sedan")
    )

    val group = cars.associateBy { it.brand }
    println(group)
}

data class Car(
    val name: String,
    val brand: String,
    val type: String
)
~~~

### 결과

~~~
{
    Sedan=Car(name=K5, brand=Kia, type=Sedan), 
    SUV=Car(name=Torres, brand=KG-Mobility, type=SUV)
}
~~~

`type` 을 키로 설정했기에, 중복된 `type` 들은 모두 제외된 것을 볼 수 있다.

## partition

특정 조건을 기준으로 참, 거짓의 두 개의 그룹으로 나누어 `Pair<List, List>` 객체를 반환합니다.

~~~kotlin
val cars = listOf(
    Car("Malibu", "Chevrolet", "Sedan"),
    Car("Seltos", "Kia", "SUV"),
    Car("Sonata", "Hyundai", "Sedan"),
    Car("Palisade", "Hyundai", "SUV"),
    Car("Torres", "KG-Mobility", "SUV"),
    Car("K5", "Kia", "Sedan")
)

val group = cars.partition { it.type == "Sedan" }
println(group)
~~~

### 결과

아래와 같이 `type = "Sedan"` 을 기준으로 두 개의 그룹으로 나뉘어 반환된 것을 볼 수 있습니다.

~~~
[
    Car(name=Malibu, brand=Chevrolet, type=Sedan), 
    Car(name=Sonata, brand=Hyundai, type=Sedan), 
    Car(name=K5, brand=Kia, type=Sedan)
], 
[
    Car(name=Seltos, brand=Kia, type=SUV), 
    Car(name=Palisade, brand=Hyundai, type=SUV), 
    Car(name=Torres, brand=KG-Mobility, type=SUV)
]
~~~





