const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let ans = []; // 난수 3자리를 굳이 숫자로 하지 말고, 그냥 배열에 넣어둬도 될듯(그게 오히려 검사할 때 더 편할거 같음)
let records = []; // 게임 기록 저장 배열(curInfo 모음집 같은 느낌)
let curInfo = {}; // 현재 게임정보로, 시작시간, 종료시간, 총시도 횟수 이렇게 들어감. 약간 C++ 구조체처럼 사용할 예정
let count = 0; // 시도 몇회인지 저장하는 변수(맞출때마다 0으로 초기화 해줘야 됨)
let history = []; // 게임 진행 내역 저장 배열

// 현재 날짜 및 시간을 반환하는 함수(yyyy-MM-dd HH:mm 꼴)
function curTime() {
  let now = new Date();
  let year = now.getFullYear();
  let month = ("0" + (now.getMonth() + 1)).slice(-2);
  let day = ("0" + now.getDate()).slice(-2);
  let hour = ("0" + now.getHours()).slice(-2);
  let min = ("0" + now.getMinutes()).slice(-2);

  return `${year}.${month}.${day} ${hour}:${min}`;
}

function watchHistory(input) {
  console.log(`${input}번 게임 결과`);
  let selectedHistory = records[parseInt(input) - 1].history; // history 변수는 비어있으니 records에서 가져오기
  for (let i = 0; i < selectedHistory.length; i++) {
    console.log("숫자를 입력해주세요: " + selectedHistory[i].input);
    console.log(selectedHistory[i].result);
  }
  console.log("3개의 숫자를 모두 맞히셨습니다.");
  console.log("-------기록 종료-------\n");

  // ***************** 이 부분 피드백 받아야될듯... 좀 더 효율적인 방법 없을까? *************************
  rl.question(
    "확인할 게임 번호를 입력하세요 (종료하려면 0을 입력): ",
    (input) => {
      console.log();
      if (input === "0") {
        main(); // 다시 게임 시작으로 돌아가기
        return;
      }
      watchHistory(input);
    }
  );
}

function watchRecord() {
  if (records.length === 0) {
    console.log("저장된 게임 기록이 없습니다.\n");
    main(); // 다시 게임 시작으로 돌아가기
  } else {
    console.log("게임 기록");
    for (let i = 0; i < records.length; i++) {
      console.log(
        `[${i + 1}] / 시작시간: ${records[i].startTime} / 종료시간: ${
          records[i].endTime
        } / 횟수: ${records[i].attempt}`
      );
    }
    console.log();
    rl.question(
      "확인할 게임 번호를 입력하세요 (종료하려면 0을 입력): ",
      (input) => {
        console.log();
        if (input === "0") {
          main(); // 다시 게임 시작으로 돌아가기
          return;
        }
        watchHistory(input);
      }
    );
  }
}

// 3자리 난수 생성 함수
function random() {
  const randNums = [];
  while (randNums.length < 3) {
    const num = Math.floor(Math.random() * 9) + 1;
    if (!randNums.includes(num)) {
      randNums.push(num);
    }
  }
  console.log(randNums); // 동작 잘하는지 빨리 보려고 넣은 코드
  return randNums;
}

// 입력값과 정답값 비교 후 볼과 스트라이크 값을 반환해주는 함수
function check(input) {
  let strike = 0;
  let ball = 0;

  const inputNums = input.split("").map(Number); // ans는 숫자열이고 input은 문자열이니까 input을 숫자열로 바꿔주기

  for (let i = 0; i < 3; i++) {
    let ans_ptr = ans[i];
    let input_ptr = inputNums[i];

    // 숫자열로 바꿨으니까 ===로 비교
    if (ans_ptr === input_ptr) {
      strike++;
    } else if (ans.includes(input_ptr)) {
      ball++;
    }
  }

  return { strike, ball };
}

function getResult(strike, ball) {
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
function gamePlay() {
  rl.question("숫자를 입력해주세요: ", (input) => {
    const { strike, ball } = check(input);
    let result = getResult(strike, ball);
    console.log(result);
    history.push({
      input: input,
      result: result,
    });
    count++;

    if (strike == 3) {
      console.log("3개의 숫자를 모두 맞히셨습니다.");
      console.log("-------게임 종료-------\n");
      curInfo.attempt = count;
      curInfo.endTime = curTime();
      curInfo.history = [...history]; // history를 초기화 해야돼서, curInfo에 넣는 식으로 해결
      records.push({ ...curInfo }); // 그냥 push하면 나중에 curInfo 또 바뀔테니까 반드시 shallow copy 해서 push 해야 됨. 그래서 spread operator 사용
      count = 0; // 횟수 0으로 다시 초기화
      history = []; // 기록도 초기화
      main(); // 다시 게임 시작으로 돌아가기
    } else {
      gamePlay();
    }
  });
}

// 게임 시작 함수
function gameStart() {
  ans = random();
  curInfo = {
    startTime: curTime(),
    endTime: null, // 얘는 게임 다 끝날 때 추가
    attempt: 0,
    // 나중에 shallow copy 할건데 history도 있음
  };
  console.log("컴퓨터가 숫자를 뽑았습니다. \n");
  gamePlay();
}

function main() {
  rl.question(
    "게임을 새로 시작하려면 1, 기록을 보려면 2, 종료하려면 9를 입력하세요.\n",
    (input) => {
      console.log();
      if (input === "1") {
        gameStart();
      } else if (input === "2") {
        watchRecord();
      } else if (input === "9") {
        console.log("애플리케이션이 종료되었습니다.");
        rl.close();
      } else {
        console.log("이상한 입력 넣지 마라");
        main();
      }
    }
  );
}

main();
