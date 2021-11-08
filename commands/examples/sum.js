function sum({args}) {

  if(args.length < 2) return "Usage: !sum <number> <number> ...";

  let result = 0;
  let output = "";

  args.forEach( number => { 
    result += parseInt(number);
    output += number + " + ";
  });

  output = output.slice(0, -3) + " = " + result;

  return output

}


module.exports = {
  name: "sum",
  aliases: ["add"],
  function: sum
}