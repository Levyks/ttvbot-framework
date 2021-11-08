require('dotenv-safe').config();
const glob = require('glob');
const tmi = require('tmi.js');

const commands = {};
const aliases = {};

const files = glob.sync('./commands/**/*.js');
  
files.forEach(file => {
  const file_exports = require(file);

  if(file_exports.length) {
    file_exports.forEach((command) => registerCommand(command, file));
  } else {
    registerCommand(file_exports);
  }

});

const client = new tmi.Client({
  options: {
    debug: process.env.debug == 1,
  },
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.BOT_TOKEN
  },
  channels: [process.env.CHANNEL_NAME]
});

client.connect().then(() => {
  console.log("Bot connected successfully");
  console.log("List of commands: ");
  console.log(Object.keys(commands));
}).catch(error => {
  console.error("Error while connecting:");
  console.error(error);
});

client.on('message', (channel, tags, message, self) => {
  
  if(self) return;
  if(!message.startsWith(process.env.PREFIX)) return;

  const args = message.slice(process.env.PREFIX.length).trim().split(" ");
  const command_name = args.shift().toLowerCase();

  const command = commands[command_name] || commands[aliases[command_name]];

  if(!command) return client.say(channel, `@${tags.username}, command '${command_name}' not found`);

  if(isCommandInCooldown(command, channel, tags)) return;

  try {

    const result = command.function({client, args, channel, tags, message, command_name});

    if(result) {
      if(result.then) result.then(response => {
        client.say(channel, response);
      });
      else {
        client.say(channel, result);
      }
    }

  } catch (err) {
    client.say(channel, `@${tags.username}, an error occured while executing command '${command_name}'`);
    console.error(`An error occured while executing command ${command_name}, called by user ${tags.username} in channel ${channel}`)
    console.error(err);
  }

});

function registerCommand(command, file) {
  if(!command || !command.name || !command.function) return;

  if(commands[command.name]) {
    console.log(`Duplicate occurrence of command '${command.name}'`);
    console.log(` ${commands[command.name].path}`);
    console.log(` ${file}`);
  }

  commands[command.name] = command;
  commands[command.name].path = file;
  
  if(command.aliases) {
    command.aliases.forEach(alias => {
      aliases[alias] = command.name;
    });
  }
}

function isCommandInCooldown(command, channel, tags) {
  
  if(command.cooldown_time) {
      
    if(command.in_cooldown) {
      client.say(channel, `@${tags.username}, command '${command.name}' is in cooldown`);
      return true;
    }

    command.in_cooldown = true;

    setTimeout(() => {
      command.in_cooldown = false;
    }, command.cooldown_time * 1000);  
    
  }

  if(command.user_cooldown_time) {
    command.users_in_cooldown = command.users_in_cooldown || new Set();

    if(command.users_in_cooldown.has(tags.username)) {
      client.say(channel, `@${tags.username}, command '${command.name}' is in cooldown for you`);
      return true;
    }

    command.users_in_cooldown.add(tags.username);

    setTimeout(() => {
      command.users_in_cooldown.delete(tags.username);
    }, command.user_cooldown_time * 1000);

  }

  return false;
}
