# NestJS GAME SERVER (CORE)

## 들어가기전
***
고등학교 때 지루한 C언어와 알고리즘을 공부하다가 옆자리 친구가 게임을 만들어 광고 수익을 내는 모습을 보고 

그 모습이 너무 부러워, 게임을 만드는 법을 구글에 열심히 친 결과 유니티 엔진에 대해 알게 되었다.
(나중에 알게 된 사실이지만 그 친구는 cocos엔진을 사용하였다..) 

이후, 오로지 구글과 유니티 공식 Docs에 의존하여 허접한 게임을 만들었고.. 3만명이나 되는 다운로드 수를 기록한 처음이자 마지막으로 배포해본 게임이 되었다.

그 이후 멀티 플레이를 지원하는 게임을 만들어보려 하였으나.. 당시 지식으로는 서버라는 개념이 너무나 어려웠고 대학교에 들어간 뒤 파이썬과 인공지능을 공부하며 서버와의 거리는 점점 멀어져만 갔는데..

3학년 때 휴학을 하고 병역특례(산업기능요원)를 계기로 첫 회사에서 아무런 지식없이(요즘 친구들은 이걸 노베라고 한다고 함..) Node.js를 사용하여 API 서버를 개발하고 배포하였다.

이 후, 여려 회사를 옮기면서 (병역특례 이슈로..) JAVA SPRING과 Nodejs, Nestjs를 통해 백엔드 포지션에서 근무하며 어느 새 백엔드 개발자로 성장하게 되었고, 비로소 고등학교 때 목표했던 게임 서버를 만들고자 한다.

***

## 계획

***
게임서버는 웹서버 또는 API 서버와 다른 점이 몇몇 있다.
예를 들면, Latency와 지연시간 차이에 신경을 써줘야 한다던가
상황에 맞게 스레드와 프로세스를 사용하여 서버의 구조를 나누고 구획화한다던가.. 기존에 공부하고 개발했던 API서버와는 또 다른 모습이다.

따라서 해당 프로젝트는 소켓통신을 통한 실시간 통신 게임 서버 라기보다는 이것저것 기능이 짬뽕된, 하지만 여러 방면에서 유용하게 쓰일 수 있는 게임 서버의 CORE를 작성해보고자 한다. 또, python을 통하여 주기적인 스케쥴링을 통해 DB내의 데이터를 정리하고 학습하는 ML을 개발하여 게임 환경을 좀 더 새롭게 만들어보고 싶다.
***

## 기술스택
***
- NestJS
    > Core 서버의 프레임워크로 사용 될 NestJS다. 3tier 계층의  구조를 갖고 MVC패턴을 적용할 계획이다.
- MySQL & Redis
    > 서버 자원을 저장할 DB이다.
- Unity
    > 서버와 통신할 클라이언트이다. 단, 해당 레파지토리에는 올리지 않을 계획이다.
- Phaser
    > 서버와 통신할 클라이언트이다. 마찬가지로 해당 레파지토리에는 올리지 않을 계획이다.
- python & tensorflow
    > 데이터 검증 및 정리. 그리고 머신러닝을 활용할 생각이다.
***

## Todo.
***
- [ ] 실시간 온라인 플레이(소켓)

    - [X] 캐릭터 위치 이동 및 동기화
    - [ ] 투사체 위치 이동 및 동기화

- [X] 스케쥴링 서버

    - [X] 스케쥴 관리 모듈 및 서비스
    - [X] 소켓 게이트웨이와 연동하여 연결된 소켓 관리 및 접속이 끊긴 유저 관리
    - [X] 매칭 서비스와 연계하여 현재 진행중인 매치 Queue를 관리

- [ ] 웹(API) 서버

    - [X] 로그인 및 회원가입
    - [ ] 매칭 서비스

- [ ] 매칭 서버

    - [X] 1:1 랜덤 매칭
    - [ ] 1:1 사용자 설정 게임
    - [ ] 2:2 랜덤 매칭
    - [ ] 2:2 사용자 설정 게임

- [ ] 채팅 서버

    - [X] 간단한 채팅 기능(test)

- [ ] CDN 서버

    sadf

- [X] 인증 서버

    JWT 토큰 기반의 인증 방식. 소켓 연결 시와 소켓 연결 종료 시에만 확인하며,
    필요 시 서비스 로직 단에서 2중 체크 및 중간 체크 가능함.

- [ ] HandOver

    PC 유저는 상관 없는데, 모바일 환경의 경우에는 인터넷 환경이 자주 바뀌고 이를 서버에서 해결해줘야 함. socket이 끊어졌다고 그냥 로그아웃 시키는 게 아니라 기다린다. 10초 20초.. 한 1분 2분 기다린다. 유저데이터 그대로 두고 기다리고, 접속이 새로 들어오면 id, 캐릭터가 이전과 같으면 로그아웃하지 않고 그 자리 그대로 계속하게 한다. 

***