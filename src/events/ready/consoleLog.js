module.exports ={
  name: 'clientReady',
  once: true,
  execute(client) {
	console.log(`${client.user.tag} est en ligne ✔️ !`);
}};
