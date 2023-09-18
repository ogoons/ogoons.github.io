---
layout: post
title: "[Android] TransactionTooLargeException"
categories: Android
---

우리는 `Activity`, `Fragment` 간에 데이터를 전달할때 `Intent`, `Bundle` 클래스를 통해 전달하곤 합니다.  
여기서 전달 가능한 데이터 량의 제한이 있고, 이를 초과 시 OS 에서는 TransactionTooLargeException 예외가 발생하며 Application 은 종료됩니다.

[Parcelables and bundles](https://developer.android.com/guide/components/activities/parcelables-and-bundles?hl=ko) 공식 문서에 따르면, Activity 혹은 Fragment 에서 전달할 데이터의 양을 몇 KB 이하로 제한할 것을 권장하고 있습니다.  
고정된 크기가 아니고 애매하게 표현하고 있습니다. 

왜 그럴까요?

문서 말미에 프로세스간 데이터 전송 섹션을 살펴보면, `Parcelables` 및 `Bundle` 을 통해 Binder 트랜잭션 데이터가 전송되고 각 프로세스에서는 실행 가능한 모든 트랜잭션에 대해 1MB 버퍼가 제공되고 있음을 대략적으로 설명하고 있습니다.

여기서 1MB는 현재 개발자가 의도한 하나의 Binder 트랜잭션 데이터를 의미하지 않습니다.

## Binder Transaction

그럼, **Binder 트랜잭션**은 어떤 작업을 의미하고 있을까요?

예를 들면 다음과 같습니다.

- onSaveInstanceState
- startActivity()
- Intent
- ContentProvider
- Telephone
- Vibrator
- ActivityManagerService
- WindowManagerService
- AlarmManagerService

위와 같이 시스템에서 제공되는 서비스 들은 리눅스 커널 레이어에서 서버 프로세스 형태로 제공되며, Binder IPC (Inter-Process Communication) 를 통해 통신하기에, **특정 순간에 이러한 프로세스에서 실행되는 전체 Binder 트랜잭션에 대한 1MB** 를 의미합니다.

## Tracking Binder Transaction

Binder 트랜잭션의 내용을 추적할 수 있는 좋은 [toolargetool](https://github.com/guardian/toolargetool) 이란 도구가 있어서 소개합니다.\
TransactionTooLargeException 예외에 대한 디버깅에 도움을 줄 수 있는 멋진 도구입니다.

## Conclusion

프로세스에서 특정 시점에 `Binder` 를 통한 모든 데이터 트랜잭션이 1MB 이상이라면, `Binder` 내부에서 `TransactionTooLargeException` 예외를 발생시킵니다.  
엄밀히 말하면 1MB 가 맞지만, 다른 작업과 동시에 처리되는 하나의 트랜잭션을 고려할 때 개발자 입장에서 더 작게 데이터를 보내야 하는 것이 정확할 것 입니다.

해당 예외로 골치를 썩고 있다면 `Activity`, `Fragment` 간에 `Bundle` 데이터 전달을 ID 만 주고받는 방식으로 리팩터링하거나, 정적 변수를 사용하는 것도 하나의 방법이 될 수 있습니다.
