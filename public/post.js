import Users from "../Controllers/userControl";

const user = {
    id: "player1",
    name: "coderhero",
    username: "Coder Hero",
    password: "password",
    ban: false
}
// Send a fetch request to the server for posting
function sendPostRequest(form, replyTo, reQuote, ogId, repostPost) {
  const time = new Date().toLocaleDateString();
  const repost = repostPost !== undefined ? repostPost.user : undefined;
  const data = {
    id: "txtr" + Math.random().toString(16).slice(2) + "tme:" + time,
    title: repostPost !== undefined ? repostPost.title : form.querySelector("input").value, 
    time: time,
    user: user,
    like: {
      total: 0,
      users: []
    },
    replyTo: replyTo,
    img: repostPost !== undefined ? repostPost.img : form.querySelector("img").value,
    ogId: ogId,
    repost: repost,
    reQuote: reQuote,
  }
  fetch('/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

// Send a fetch request to the server for liking
function sendLikeRequest(post) {
  fetch(`/like/${post.id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      post: post,
      user: user
    }),
  });
}
