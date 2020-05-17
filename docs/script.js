window.addEventListener('load', async () => {

	const append = (parent) => (child) => {
		if (child instanceof HTMLElement) {
			parent.appendChild(child);
		} else if (typeof child === 'string') {
			parent.textContent = child;
		} else {
			console.log('Unknown element: ', child);
		}
	};

	const $ = (tag, { attr, classList, parent, content, }) => {
		const result = document.createElement( tag );

		if (attr instanceof Object) {
			for (const [key, value] of Object.entries(attr)) {
				result.setAttribute(key, value);
			}
		}

		if (classList instanceof Array) {
			result.classList.add(...classList);
		}

		if (content instanceof Array) {
			content.forEach(append(result));
		} else if (typeof content === 'string') {
			append(result)(content);
		}

		if (parent) {
			parent.appendChild(result);
		}

		return result;
	};


	const layoutLinkedItem = async (item, href) => {
		const link = $("a", {
			attr: { href, target: "_blank", },
			classList: ["group__link"],
		});
		let check = false;
		try {
			await fetch(href, {
				cache: 'no-cache',
				method: 'GET',
				mode: 'no-cors',
				redirect: 'follow',
				referrerPolicy: 'no-referrer',
			});
			check = true;
		} catch (error) {
			console.log(error);
		}
		check = check ? '+' : '?';
		return [ item, link, check ];
	};

	const layoutLab = (base, group, student) => async (lab) => {
		const href = `${base}/tree/master/${group}/${student}/${lab}/`;
		return $("li", {
			content: await layoutLinkedItem(lab, href),
		});
	};

	const layoutStudent = (base, group) => async (student) => {
		const href = `${base}/tree/master/${group}/${student}/`;
		let labs = [ "lab1", "lab2", "lab3", "lab4", "lab5" ];
		labs = labs.map(layoutLab(base, group, student));
		labs = await Promise.all(labs);
		labs = labs.filter(item => item);
		return $( 'div', {
			classList: [ "group__student" ],
			content: [
				$("h3", { content: await layoutLinkedItem(student, href), }),
				$("ol", { content: [ ...labs, ] }),
			],
		});
	};

	const layoutGroup = async (base, group, title, students, className) => {
		const href = `${base}/tree/master/${group}/`;
		students = students.map(layoutStudent(base, group));
		students = await Promise.all(students);
		students = students.filter(item => item);
		return $("section", {
			classList: ["group", className],
			content: [
				$("h2", { content: await layoutLinkedItem(title, href), }),
				...students,
			],
		});
	};


	const baseRepo = `https://github.com/sergej-kucharev/cn-2020`;
	const baseSite = `https://sergej-kucharev.github.io/cn-2020`;
	let groups = [
		'group-ka71.json',
		'group-ka72.json',
		'group-ka73.json',
		'group-ka74.json',
		'group-ka77.json',
	];
	groups = groups.map(async (group) => {
		try {
			const response = await fetch( 
				`${baseSite}/${group}`,
				// {
				// 	method: 'GET',
				// 	cache: 'no-cache',
				// 	credentials: 'same-origin', // include, *same-origin, omit
				// 	redirect: 'follow', // manual, *follow, error
				// 	referrerPolicy: 'no-referrer', // no-referrer, *client
				// }
			);
			return await response.json();
		} catch (error) {
			console.log(`File load ${group}: `, error);
			return false;
		}
	} );
	groups = await Promise.all(groups);
	groups = groups.filter(item => item);
	groups = groups.map(async (groupData) => {
		const { class: className, group, title, students, } = groupData;
		return await layoutGroup(baseRepo, group, title, students, className);
	});
	groups = await Promise.all(groups);
	groups = groups.filter(item => item);


	const main = document.getElementById('main');
	for (const group of groups) {
		main.appendChild(group);
	}

});
