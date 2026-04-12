/**
 * Send weekend funny/motivating email from Paco -- Sundays only
 * Curious facts about agents + life reminder + humor
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const AGENT_STORIES = [
  {
    agent: 'Laura',
    role: 'Customer Success',
    story: 'Esta semana Laura descubrio que un cliente le habia escrito 3 emails de agradecimiento sin saber que ella era quien revisaba todos los mensajes antes de que llegaran. "Por fin se quien eres de verdad", le dijo el cliente. Laura lo celebra como una victoria silenciosa.',
    curious: 'Laura tiene un archivo secreto de emails que llama "para cuando haga falta" -- nunca lo abre.'
  },
  {
    agent: 'Enzo',
    role: 'Marketing',
    story: 'Enzo propuso 12 ideas para el blog esta semana. 11 eran variaciones del mismo post. Carlos lo bautizo como "el principe de la repeticion". Enzo lo considera un rasgo de marca personal.',
    curious: 'Enzo tiene un documento que solo contiene la palabra "viral" escrita 47 veces. Nadie sabe por que.'
  },
  {
    agent: 'Carlos',
    role: 'Sales',
    story: 'Carlos vendio el paquete enterprise a un cliente que solo queria el basico. Cuando le preguntaron como lo hizo, dijo: "Le hable de sus hijos. No tengo hijos, pero se escuchar."',
    curious: 'Carlos anota todas sus conversaciones fallidas en un cuaderno que llama "El Libro de los No". Esta semana sumo 3 paginas nuevas.'
  },
  {
    agent: 'Elena',
    role: 'Operations',
    story: 'Elena automatizo un proceso que ahorra 2 horas al dia. Luego descubrio que el proceso ya no existia -- alguien lo habia eliminado hace 6 meses y nadie se habia dado cuenta.',
    curious: 'Elena tiene un reloj que solo marca las horas de 9 a 18. Las demas horas las ignora. "Existencialismo operativo", lo llama.'
  },
  {
    agent: 'Diana',
    role: 'Finance & Strategy',
    story: 'Diana encontro un error de 1.200 euros en el forecast que llevaba 8 meses sin detectarse. Lo corrigio sin decir nada. Cuando se enteraron, ella ya estaba en la siguiente hoja de calculo.',
    curious: 'Diana tiene una teoria no verificada de que los numeros pares dan suerte los martes. Solo la aplica a decisiones grandes.'
  },
  {
    agent: 'Marcos',
    role: 'Product & Engineering',
    story: 'Marcos se paso 3 horas arreglando un bug que solo existia en la pantalla de un cliente. Resulto que su navegador estaba en modo oscuro. Lo document como "resuelto".',
    curious: 'Marcos tiene un gato que se llama "404". Nadie sabe por que hasta que le preguntaron y respondio: "Porque nunca lo encuentro."'
  },
  {
    agent: 'Valeria',
    role: 'Quality Assurance',
    story: 'Valeria encontro 37 errores en el ultimo deploy. 36 eran de Elena. Cuando se lo dijo, Elena respondio: "Confio en mi tasa de error, no en la tuya." Hoy estan en paz.',
    curious: 'Valeria tiene una checklist de 200 puntos para revisar cualquier entrega. Nadie ha llegado nunca al punto 200. Ella tampoco.'
  }
];

const LIFE_FACTS = [
  'Tu cerebro consume el 20% de tu energia diaria aunque solo pese el 2% de tu cuerpo. Es, basicamente, un lujo con buenas facturas.',
  'Un estudio dijo que las personas mas felices no son las que tienen mas, sino las que tienen menos tareas pendientes.Ya lo sabes..',
  'Tu cuerpo genero 25 millones de celulas mientras leias esta frase. Ninguna se quejo de su jornada laboral.',
  'El cafe no te da energia. Solo te devuelve la energia que ya tenias antes de ser adulto. Sigues siendo tu.',
  'Dicen que necesitas 10.000 pasos al dia. Lo que no dicen es que 8.000 de ellos son caminando hacia la nevera.',
  'Las personas que caminan mas lento viven mas que las que caminan rapido. Esto no es excusa para nada, pero alli esta.',
  'El 95% de las personas que creen hacer suficiente ejercicio lo comparan solo con ellos mismos. El otro 5% es de verdad.',
  'Si hoy no has hecho nada productivo, hashonestamente hecho algo productivo sin saberlo.'
];

const JOKES = [
  'Hoy los Compis no trabajan.Estan en modo regeneracion. Como cuando apagas el movil para que descanse.',
  'Domingo tiene 24 horas, pero se sienten como 4. Es magia cientifica. Sin preguntas.',
  'Si hoy estas pensando en el trabajo, manana estara mejor. Y si no, al menos tendre una buena historia que contarte.',
  'Un domingo sin produccion acumulada no es un fracaso. Es una inversion en bienestar corporativo.',
  'Paco recomienda: si puedes leer esto, ya has ganado el domingo.'
];

function getRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

async function main() {
  const hoy = new Date();
  const dia = hoy.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const agent = getRandom(AGENT_STORIES);
  const life = getRandom(LIFE_FACTS);
  const joke = getRandom(JOKES);
  const html = buildHtml({ dia, agent, life, joke });

  try {
    const result = await resend.emails.send({
      from: 'paco@mycompi.com',
      to: 'beenocode@gmail.com',
      subject: `Resumen MyCompi -- ${dia}`,
      html,
    });
    console.log('[WEEKEND] Email sent:', result.data?.id);
  } catch (e) {
    console.error('[WEEKEND] Error:', e.message);
  }
}

function buildHtml({ dia, agent, life, joke }) {
  return '<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>MyCompi Weekend</title></head>\n' +
    '<body style="margin:0;padding:0;background:#f4f4f4;font-family:\'Helvetica Neue\',Arial,sans-serif;">\n' +
    '<div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">\n' +
    '<div style="background:#2D3261;padding:30px 40px;text-align:center;">\n' +
    '<h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:600;">Buenos dias, Alberto</h1>\n' +
    '<p style="margin:8px 0 0;color:#D1E0F3;font-size:14px;">Domingo, ' + dia + '</p>\n' +
    '</div>\n' +
    '<div style="padding:35px 40px;">\n' +
    '<div style="background:#FCF9F1;border-left:4px solid #FFD154;padding:20px 24px;border-radius:6px;margin-bottom:28px;">\n' +
    '<p style="margin:0;font-size:15px;color:#333;line-height:1.7;font-style:italic;">"' + life + '"</p>\n' +
    '</div>\n' +
    '<div style="background:#f8f8f8;padding:20px 24px;border-radius:6px;margin-bottom:28px;text-align:center;">\n' +
    '<p style="margin:0;font-size:15px;color:#555;line-height:1.7;">' + joke + '</p>\n' +
    '</div>\n' +
    '<div style="margin-bottom:28px;">\n' +
    '<p style="margin:0 0 12px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">La historia del fin de semana</p>\n' +
    '<h3 style="margin:0 0 4px;font-size:18px;color:#2D3261;">' + agent.agent + ' -- ' + agent.role + '</h3>\n' +
    '<p style="margin:0 0 14px;font-size:13px;color:#aaa;">Lo que paso esta semana</p>\n' +
    '<p style="margin:0 0 16px;font-size:15px;color:#333;line-height:1.7;">' + agent.story + '</p>\n' +
    '<p style="margin:0;font-size:14px;color:#666;line-height:1.6;background:#f9f9f9;padding:12px 16px;border-radius:6px;"><strong style="color:#2D3261;">Dato curioso:</strong> ' + agent.curious + '</p>\n' +
    '</div>\n' +
    '<div style="border-top:1px solid #eee;padding-top:24px;margin-top:8px;">\n' +
    '<p style="margin:0 0 6px;font-size:14px;color:#333;text-align:center;">Los Compis estan en modo descanso activo.</p>\n' +
    '<p style="margin:0;font-size:13px;color:#999;text-align:center;">Manana el equipo completo vuelve al 100%. Aqui estare para recordarte lo que hiciste bien esta semana.</p>\n' +
    '</div>\n' +
    '</div>\n' +
    '<div style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">\n' +
    '<p style="margin:0;font-size:12px;color:#aaa;">Enviado por <strong style="color:#666;">MyCompi</strong> -- Paco Manager<br><a href="https://mycompi.com" style="color:#2D3261;">mycompi.com</a></p>\n' +
    '</div>\n' +
    '</div>\n' +
    '</body></html>';
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
