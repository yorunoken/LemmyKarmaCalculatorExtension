const instance = window.location.host;
const baseURL = `https://${instance}/api/v3`;

let shown = false;

function getJwtCookie(cookieName) {
  const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === cookieName) {
      return value;
    }
  }
  return null;
}

async function main() {
  shown = true;
  var ulElement = document.querySelectorAll(".list-inline.mb-2")[1];
  var newLi = document.createElement("li");
  newLi.className = "list-inline-item badge text-bg-light";

  newLi.textContent = `Loading...`;
  ulElement.appendChild(newLi);

  const auth = getJwtCookie("jwt");

  if (!auth) {
    return;
  }

  const totalPosts = [];
  const totalComments = [];

  let pageIndex = 1;
  while (true) {
    const request = await getPosts(auth, pageIndex);
    const { posts, comments } = request;

    if (posts.length === 0 && comments.length === 0) {
      break;
    }

    totalPosts.push(...posts);
    totalComments.push(...comments);
    pageIndex++;
  }

  let totalKarma = 0;

  totalPosts.forEach((post) => {
    totalKarma += post.counts.score;
  });

  totalComments.forEach((comment) => {
    totalKarma += comment.counts.score;
  });

  newLi.textContent = `${totalKarma} Karma`;
  ulElement.appendChild(newLi);
}

async function getPosts(auth, page) {
  const url = window.location.href;
  const username = extractUsernameFromUrl(url);

  const endpoint = `${baseURL}/user?username=${username}&sort=New&page=${page}&limit=50&auth=${auth}`;
  const response = await fetch(endpoint);
  return response.json();
}

function extractUsernameFromUrl(url) {
  const parts = url.split("/");
  const index = parts.indexOf("u");
  if (index !== -1 && index + 1 < parts.length) {
    const usernameWithQuery = parts[index + 1];
    const queryIndex = usernameWithQuery.indexOf("?");
    if (queryIndex !== -1) {
      return usernameWithQuery.substring(0, queryIndex);
    }
    return usernameWithQuery;
  }
  return null;
}

function refreshExtension() {
  const targetNode = document.getElementsByClassName("person-details")[0];
  if (!shown && targetNode) {
    main();
  }
  if (!targetNode) {
    shown = false;
  }
}
setInterval(refreshExtension, 500);

main(); // initialize the extension
