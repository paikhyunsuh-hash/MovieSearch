/*******전역 변수 설정 및 초기 API 호출******/
let movieBoard = document.querySelector("#movieBoard");
let apikey = "52d3cd52fcabb7a6f31dbe54c5337877";

// 현재 페이지 번호
let currentPage = 1;
// 현재 불러온 영화 목록의 종류 (기본값: 현재상영작)
let currentList = "now_playing";
// '더보기' 버튼 요소
const moreBtn = document.querySelector("#more");
// 장르 ID와 이름 객체
let genreList = {};

/******장르 목록을 TMDb API에서 가져와 genreList 객체에 저장.******/

const fetchGenres = async () => {
  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apikey}&language=ko-KR`;
  const response = await fetch(url);
  const data = await response.json();

  data.genres.forEach((genre) => {
    genreList[genre.id] = genre.name;
  });
  console.log("Genre List Fetched:", genreList);
};

// 장르 정보를 먼저 불러온 후, 기본 영화 목록을 호출.
fetchGenres().then(() => {
  movie(currentList, currentPage);
});

/******영화 데이터 API 호출 함수******/

let movie = async (lists, page = 1, append = false) => {
  // 새로 검색하거나 목록을 바꿀 경우 (append가 false일 때)
  if (!append) {
    currentPage = 1; // 페이지 초기화
    currentList = lists; // 목록 종류 업데이트
    window.scrollTo(0, 0); // 화면 최상단으로 이동
  } else {
    currentPage = page; // 페이지 업데이트
  } // API 호출 URL 설정 (검색인지 일반 목록인지 구분)

  let url = lists.includes("search")
    ? lists + `&api_key=${apikey}&language=ko-KR&page=${page}`
    : `https://api.themoviedb.org/3/movie/${lists}?api_key=${apikey}&language=ko-KR&page=${page}`;

  let response = await fetch(url);
  let data = await response.json();

  console.log(data);
  let movieList = data.results; // 영화 배열 추출

  render(movieList, append); // 영화 목록을 화면에 렌더링
};

/******영화의 장르 ID 배열을 장르 이름 문자열로 변환.******/
const getGenreNames = (genreIds) => {
  if (!genreIds || genreIds.length === 0) {
    return "장르 정보 없음";
  }

  return genreIds.map((id) => genreList[id] || "알 수 없음").join(", ");
};

/******영화 카드 렌더링 함수******/

let render = (movieList, append = false) => {
  if (!append) {
    movieBoard.innerHTML = ""; // 새로고침 시 기존 내용 삭제
  }

  let cardHTML = "";

  movieList.forEach((movie) => {
    const genreNames = getGenreNames(movie.genre_ids); // 출시일에서 연도만.
    const releaseYear = movie.release_date
      ? `${movie.release_date.substring(0, 4)}` // "YYYY-MM-DD"에서 YYYY 추출
      : "";

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
      : "https://via.placeholder.com/500x750?text=No+Poster"; // TMDb 영화 상세 페이지 링크 생성

    const movieLink = `https://www.themoviedb.org/movie/${
      movie.id
    }-${movie.original_title.toLowerCase().replace(/\s/g, "-")}`;

    cardHTML += `
<div class="card">
    <div class="poster" data-movie-id="${movie.id}">
        <img src="${posterUrl}"></img>
        <div class="description">
            <h4 class="rating">평점:
                <span> ${movie.vote_average.toFixed(1)}
                </span>
            </h4>
            <h4 class="synopsis">${movie.overview}
            </h4> 
            <h4 class="genre">${genreNames}
            </h4>
        </div>
    </div>
    <a href="${movieLink}" target="_blank">
        <div class="title">
            <span class="date">${releaseYear}
            </span>
            <h3>
                ${movie.title}
               
            </h3>
        </div>
    </a>
</div>`;
  });
  // 생성된 HTML을 보드에 추가
  movieBoard.innerHTML += cardHTML;
};

/******검색 및 더보기 이벤트 핸들러******/

// 검색 입력창
let searchInput = document.querySelector("#searchInput");
// 검색 버튼
let searchBtn = document.querySelector("#searchBtn");

// 검색 버튼 클릭 이벤트: 검색 실행
searchBtn.addEventListener("click", async () => {
  let keyword = searchInput.value.trim();
  console.log(keyword);

  if (keyword == "") {
    alert("검색어를 입력하세요.");
    return;
  }

  const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${keyword}`;
  // 검색 결과 1페이지 로드 (새로고침)
  movie(searchUrl, 1, false);
});

// 검색 입력창 Enter 키 입력 이벤트: 검색 실행
searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    searchBtn.click(); // 검색 버튼 클릭 효과 발생
  }
});

// 더보기 버튼 클릭 이벤트: 다음 페이지 로드
if (moreBtn) {
  moreBtn.addEventListener("click", () => {
    const nextPage = currentPage + 1;

    movie(currentList, nextPage, true); // 다음 페이지 로드 (추가)
  });
}

/******jQUERY******/

/*상세설명*/
$(function () {
  $("#movieBoard").on("mouseenter", ".card", function () {
    $(this).find(".description").addClass("active");
    $(this).find(".poster img").addClass("blur");
  });

  $("#movieBoard").on("mouseleave", ".card", function () {
    $(this).find(".description").removeClass("active");
    $(this).find(".poster img").removeClass("blur");
  });
});

/*위로 버튼*/
$("#toTopBtn").on("click", function () {
  $("html, body").animate(
    {
      scrollTop: 0,
    },
    200
  );
});

/*베뉴 버튼*/
$(function () {
  $(".menu button").on("click", function () {
    $(".menu button").removeClass("active");
    $(this).addClass("active");
  });
});

/*화면모드*/
$(function () {
  $(".mode .day").on("click", function () {
    $(this).hide();
    $(".night").show();
    $("body").toggleClass("day");
    $(".headerLeft").toggleClass("day");
    $(".headerRight").toggleClass("day");
    $(".headerInner").toggleClass("day");
    $("h1").toggleClass("day");
    $(".card").toggleClass("day");
    $(".title").toggleClass("day");
    $("#utility-buttons > button").toggleClass("day");
  });
  $(".mode .night").on("click", function () {
    $(this).hide();
    $(".day").show();
    $("body").toggleClass("day");
    $(".headerLeft").toggleClass("day");
    $(".headerRight").toggleClass("day");
    $(".headerInner").toggleClass("day");
    $("h1").toggleClass("day");
    $(".card").toggleClass("day");
    $(".title").toggleClass("day");
    $("#utility-buttons > button").toggleClass("day");
  });
});
