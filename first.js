const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 게임 기록 객체
class GameRecord {
  constructor(startTime, endTime, tryCount, gameHistory) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.tryCount = tryCount; // 시도 몇회인지 저장하는 변수(게임 끝날때마다 0으로 초기화 해줘야 됨)
    this.gameHistory = gameHistory; // 게임 진행 내역 저장 배열(모든 history가 여기 다 담김)
  }
}

// 게임 상세 내역 객체
class GameHistory {
  constructor(input, result) {
    this.input = input; // 사용자 입력
    this.result = result; // 결과값(볼 스트라이크)
  }
}

class MainGame {
  constructor() {
    this.totalRecord = []; // 전체 기록들이 GameRecord 객체 단위로 여기 담김
    this.currentHistory = []; // 현재 게임 history 1개(이게 totalRecord의 gameHistory에 들어감)
    this.currentGameInfo = null;
    this.currentTry = 0;
    this.answer = [];
  }

  // 현재 날짜 및 시간을 반환하는 함수(yyyy-MM-dd HH:mm 꼴)
  getCurrentTime() {
    const PADDING_ZERO = "0";

    let now = new Date();
    let year = now.getFullYear();
    let month = (PADDING_ZERO + (now.getMonth() + 1)).slice(-2);
    let day = (PADDING_ZERO + now.getDate()).slice(-2);
    let hour = (PADDING_ZERO + now.getHours()).slice(-2);
    let minute = (PADDING_ZERO + now.getMinutes()).slice(-2);

    return `${year}.${month}.${day} ${hour}:${minute}`;
  }

  watchHistory() {
    rl.question(
      "확인할 게임 번호를 입력하세요 (종료하려면 0을 입력): ",
      (input) => {
        console.log();
        if (input === "0") {
          this.main(); // 다시 게임 시작으로 돌아가기
          return;
        }
        console.log(`${input}번 게임 결과`);
        let selectedHistory = this.totalRecord[parseInt(input) - 1].gameHistory; // history 변수는 비어있으니 gameRecords에서 가져오기
        for (let i = 0; i < selectedHistory.length; i++) {
          console.log("숫자를 입력해주세요: " + selectedHistory[i].input);
          console.log(selectedHistory[i].result);
        }
        console.log("3개의 숫자를 모두 맞히셨습니다.");
        console.log("-------기록 종료-------\n");

        this.watchHistory();
      }
    );
  }

  watchRecord() {
    if (this.totalRecord.length === 0) {
      console.log("저장된 게임 기록이 없습니다.\n");
      this.main(); // 다시 게임 시작으로 돌아가기
    } else {
      console.log("게임 기록");
      for (let i = 0; i < this.totalRecord.length; i++) {
        console.log(
          `[${i + 1}] / 시작시간: ${
            this.totalRecord[i].startTime
          } / 종료시간: ${this.totalRecord[i].endTime} / 횟수: ${
            this.totalRecord[i].tryCount
          }`
        );
      }

      console.log();
      this.watchHistory();
    }
  }

  // 3자리 난수 생성 함수
  getRandom() {
    while (this.answer.length < 3) {
      const num = Math.floor(Math.random() * 9) + 1;
      if (!this.answer.includes(num)) {
        this.answer.push(num);
      }
    }
    console.log("정답: " + this.answer);
  }

  // 입력값과 정답값 비교 후 볼과 스트라이크 값을 반환해주는 함수
  checkAnswer(input) {
    let strike = 0;
    let ball = 0;

    const inputNums = input.split("").map(Number); // answer는 숫자열이고 input은 문자열이니까 input을 숫자열로 바꿔주기

    for (let i = 0; i < 3; i++) {
      let answerDigit = this.answer[i];
      let inputDigit = inputNums[i];

      // 숫자열로 바꿨으니까 ===로 비교
      if (answerDigit === inputDigit) {
        strike++;
      } else if (this.answer.includes(inputDigit)) {
        ball++;
      }
    }

    return { strike, ball };
  }

  getResult(strike, ball) {
    if (strike == 0 && ball == 0) {
      return "낫싱";
    } else if (strike == 0) {
      return ball + "볼";
    } else if (ball == 0) {
      return strike + "스트라이크";
    } else {
      return ball + "볼 " + strike + "스트라이크";
    }
  }

  // 메인 게임 함수
  playGame() {
    rl.question("숫자를 입력해주세요: ", (input) => {
      const { strike, ball } = this.checkAnswer(input);
      let result = this.getResult(strike, ball);
      console.log(result);

      let gameHistory = new GameHistory(input, result); // 입력과 출력 한 세트
      this.currentHistory.push(gameHistory); // 한세트씩 push
      this.currentTry++;

      if (strike == 3) {
        console.log("3개의 숫자를 모두 맞히셨습니다.");
        console.log("-------게임 종료-------\n");
        let gameRecord = new GameRecord(
          this.currentGameInfo.startTime,
          this.getCurrentTime(),
          this.currentTry,
          [...this.currentHistory]
        );

        this.totalRecord.push(gameRecord);
        this.currentTry = 0; // 횟수 0으로 다시 초기화
        this.answer = []; // 정답값도 초기화
        this.currentHistory = []; // 기록도 초기화
        this.main(); // 다시 게임 시작으로 돌아가기
      } else {
        this.playGame();
      }
    });
  }

  // 게임 시작 함수
  startGame() {
    this.getRandom();
    this.currentGameInfo = {
      startTime: this.getCurrentTime(),
    };
    console.log("컴퓨터가 숫자를 뽑았습니다. \n");
    this.playGame();
  }

  main() {
    rl.question(
      "게임을 새로 시작하려면 1, 기록을 보려면 2, 종료하려면 9를 입력하세요.\n",
      (input) => {
        console.log();
        if (input === "1") {
          this.startGame();
        } else if (input === "2") {
          this.watchRecord();
        } else if (input === "9") {
          console.log("애플리케이션이 종료되었습니다.");
          rl.close();
        } else {
          console.log("잘못된 입력입니다. 다시 입력해주세요.");
          this.main();
        }
      }
    );
  }
}

const game = new MainGame();
game.main();
