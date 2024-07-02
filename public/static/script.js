function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? match[1] : undefined;
}
const maxIdCookie = getCookie(`__Secure-max_id`);
if (!maxIdCookie) {
  fetch("/id");
}
