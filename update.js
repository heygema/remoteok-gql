#!/var/folders/8x/ccj5sfqx3fj32sflk4zqk6bh0000gp/T/fnm_multishell_63976_1611424821176/bin/node

const path = require("path");
const fs = require("fs");
const fetch = require("@vercel/fetch-retry")(require("node-fetch"));

async function main() {
  let result = await fetch("https://remoteok.io/api");
  let data = await result.json();

  fs.writeFile(
    path.join(__dirname, "./public/remoteok.json"),
    JSON.stringify(data),
    () => {
      console.log("done");
    }
  );
}

main();
