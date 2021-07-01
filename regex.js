const regexList = 
	[
		// 'ig_embed' => /(?:(?:https?|http):\/\/|www\.|m\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm,
		/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
		/([Cc][Uu][Rr]) ([A-Za-z][A-Za-z][A-Za-z])(>)([A-Za-z][A-Za-z][A-Za-z]) ([0-9.]+)/g,
		/[Jj][Ii][Dd][Aa][TtDd]/g,
	];

const regexKeys =
	[
		'ig_embed',
		'cur_conv',
		'jidat'
	];


exports.regexList = regexList;
exports.regexKeys = regexKeys;