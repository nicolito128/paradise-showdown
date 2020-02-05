import * as fs from 'fs';

function createWindows(): string {
	let page: string = `>view-shop\n|init|html\n|title|[Shop] Tienda\n`;

	let html: string = `|pagehtml|<div class="pad"><p>${getShop()}</p></div>`;

	const pagehtml = page + html;
	return pagehtml;
}

function getShop(): string {
	const data = JSON.parse(fs.readFileSync(__dirname + '/../../../server/plugins/economy/data/shop.json'));

	let shop: string = '<div style="margin: auto; text-align: center;">';
	shop += `<h1 style="font-weight: bold;">Tienda de <span style="color: #56C043">${Config.serverName}</span></h1>`;
	shop += '<table border="1" style="margin: auto; text-align: center;"></thead><tr><th style="padding: 3.5px;">Item</th> <th style="padding: 3.5px;">Description</th> <th style="padding: 3.5px;">Price</th> <th style="padding: 3.5px;">Buy</th></tr></thead>'
	shop += '<tbody>'
	for (let i in data) {
		let item: any = data[i];
		shop += '<tr>';
		shop += `<td style="padding: 3.5px;">${item.name}</td>`;
		shop += `<td>${item.desc}</td>`
		shop += `<td style="padding: 3.5px;">${item.price}</td>`;
		shop += `<td style="padding: 3.5px;"><button class="button"><em class="fa fa-shopping-cart fa-lg" aria-hidden="true"></em></button></td>`;
		shop += '</tr>';
	}
	shop += '</tbody></table></div>'

	return shop;
}

const commands: ChatCommands = {
	shop: {
		'': 'view',
		view(target, room, user, connection) {
			connection.send(createWindows());
		}
	}
}

export default commands;