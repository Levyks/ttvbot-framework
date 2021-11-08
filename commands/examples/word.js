const axios = require('axios');

function word({tags}) {

  return axios.get("https://random-word-api.herokuapp.com/word?number=1&swear=0").then(response => {
    return `@${tags.username}, here's a fresh random word for you: ${response.data[0]}`;
  }).catch(error => {
    return `@${tags.username}, something went wrong with the API request`;
  });

}

module.exports = {
  name: "word",
  aliases: ["add"],
  function: word,
  user_cooldown_time: 5,
}