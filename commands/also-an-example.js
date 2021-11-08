//You can put your files anywhere inside the commands folder.
module.exports = {
  name: "hello",
  function: ({tags}) => `Hello, @${tags.username}!`
}