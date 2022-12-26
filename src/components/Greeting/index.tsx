export function Greeting(): JSX.Element {
  let message = '';
  const hours = new Date().getHours();

  switch (true) {
    case hours >= 22:
      message = 'Só mais uma matéria antes de dormir né? 💤';
      break;
    case hours >= 18:
      message = 'Boa noite, que tal acompanhar como anda o mercado? 💡';
      break;
    case hours >= 12:
      message = 'Boa tarde, as maiores tecnologia do mercado te aguardam 💻';
      break;
    case hours >= 6:
      message = 'Bom dia, nada melhor que aproveitar a manhã lendo ☕';
      break;
    default:
      message = 'Ótima madrugada para ler, aproveite 🌙';
      break;
  }

  return <h1>{message}</h1>;
}
