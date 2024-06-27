function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? match[1] : undefined;
}

const maxIdCookie = getCookie("max_id");
if (!maxIdCookie) {
  fetch("/id");
}

const refresh = () => {
  window.location.reload();
};
