function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? match[1] : undefined;
}
const maxIdCookie = getCookie(`__Secure-max_id`);
if (!maxIdCookie) {
  fetch("/id");
} else {
  const now = new Date().getTime();
  const { timestamp } = JSON.parse(decodeURIComponent(maxIdCookie));
  if (now > timestamp + 86400000) {
    /* more than 1 day */
    fetch("/id");
  }
}
