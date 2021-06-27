const url = require('url');
const { Curl, CurlFeature } = require('node-libcurl');
const { JSDOM } = require('jsdom');
const Discord = require('discord.js');

const token = require('./token.json');

const client = new Discord.Client({intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES]});

client.on('ready', () => {
    console.log('Logged in as', client.user.username);
});

const regx = /(?:(?:https?|http):\/\/|www\.|m\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm;
const curegx = /(cur) ([A-Za-z][A-Za-z][A-Za-z])(>)([A-Za-z][A-Za-z][A-Za-z]) ([0-9.]+)/g;

client.on('message', message => {
    if(message.author == client.user) return;

    const cur = message.content.match(curegx);
    const urls = message.content.match(regx);

    if(urls == null && cur == null) return;
    if(cur != null){curConvert(cur[0],message);return;}
    if(urls.length < 1) return;
    let firstUrl;
    try{
        firstUrl = new url.URL(urls[0]);
    }catch(err){
        return;
    }

    if(firstUrl.host !== 'instagram.com' && firstUrl.host !== 'www.instagram.com') return;
    else process(firstUrl.href, message);
});

async function curConvert(cur,message){
    var data = cur.split(' ');
    var orig = data[1].split('>')[0].toUpperCase();
    var dest = data[1].split('>')[1].toUpperCase();
    var amt = data[2]-0;

    var apiKey = "7472befdc7166346babd";
    var url = "https://free.currconv.com/api/v7/convert?q="+orig+"_"+dest+"&compact=ultra&apiKey="+apiKey;

    const conv = await request(url,true);
    var rate = JSON.parse(conv)[orig+"_"+dest];
    var sum = (Math.round(amt*rate*100)/100).toFixed(2);
    var msg = new Discord.MessageEmbed({
                                        color:'#00ff00',
                                        title:'≈'+sum+' '+dest,
                                        description:'Current Rate : 1 '+orig+' ≈ '+rate+' '+dest,
                                        thumbnail:{
                                                url:'https://cdn.discordapp.com/attachments/852424136231878666/858478733047889950/510WmeXkLXL.png',
                                                height:150,
                                                width:150}
                                        });

    message.reply(msg);
}

function request(url,raw=false){
    return new Promise((resolve, reject)=>{
    const curl = new Curl();
    curl.setOpt(Curl.option.HTTPHEADER, ['User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0']);
    curl.setOpt('URL', url);
    curl.setOpt('FOLLOWLOCATION', true);
    if(raw==false) curl.enable(CurlFeature.NoDataParsing);
    curl.on('end', async function (statusCode, data, headers) {
        resolve(data);
        this.close();
    });
    curl.on('error', ()=>{
        curl.close.bind(curl);
        reject();
    });
    curl.perform();
    });
}

async function process(url, message){
    const html = await request(url);
    const searchPage = new JSDOM(html).window.document;
    const metas = searchPage.getElementsByTagName('meta');
    var foundVideo;
    var foundImage;
    for(meta of metas){
        if(meta.getAttribute('name') == 'medium') medium = meta.getAttribute('content');
        const property = meta.getAttribute('property');
        if(property == null) continue;
        if(!property.startsWith('og:')) continue;
        if(property == 'og:title') title = meta.getAttribute('content').split(":")[0];
        if(property == 'og:description') description = meta.getAttribute('content');
        if(property == 'og:video') foundVideo = meta.getAttribute('content');
        if(property == 'og:image') foundImage = meta.getAttribute('content');
        if(!property.startsWith('og:video')) continue;
        if(property == 'og:video:width') videoWidth = meta.getAttribute('content');
        if(property == 'og:video:height') videoHeight = meta.getAttribute('content');
    }

    if(medium!=undefined){
        if(foundVideo != undefined){
            const video = await request(foundVideo);
            if(video.length > 8388608){
                message.channel.send(`${foundVideo}`);
            }else{
                message.channel.send('', {files: [{attachment: video, name: 'instagram.mp4'}]});
            }
            var msg = new Discord.MessageEmbed({
                                            hexColor:'',
                                            title:title,
                                            description:description,
                                            video:{
                                                url:foundVideo,
                                                width:videoWidth,
                                                height:videoHeight
                                            }
                                        });
        }else if(foundImage != undefined){
            var msg = new Discord.MessageEmbed().setColor('#00ff00')
                                                .setTitle(title)
                                                .setDescription(description)
                                                .setImage(foundImage);
        }
    }else{
            var msg = new Discord.MessageEmbed().setColor('#ff0000')
                                                .setTitle("ERROR")
                                                .setDescription("Yah ga bisa :menangos:");
    }
    
    message.channel.send(msg);
}

client.login(token);