window.addEventListener('load', async () => {

	const append = (parent) => (child) => {
		if (child instanceof HTMLElement) {
			parent.appendChild(child);
		} else if (typeof child === 'string') {
			parent.appendChild(document.createTextNode(child));
			// parent.textContent = child;
		} else {
			console.log('Unknown element: ', child);
		}
	};

	const $ = (tag, { attr, classList, parent, content, }) => {
		const result = document.createElement(tag);

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
		} else if (content) {
			append(result)(content);
		}

		if (parent) {
			parent.appendChild(result);
		}

		return result;
	};


	const layoutCheck = (href, { title, text = '?', ok = '+', no = '-', attr = {}, }) => {
		const layout = $('span', {
			attr: { ...attr, ...title && { title }, },
			classList: ["group__check"],
			content: text,
		});
		const remove = parent => {
			while (parent && parent.lastElementChild) {
				parent.removeChild(parent.lastElementChild);
			}
		};
		layout.addEventListener('click', async (event) => {
			remove(layout);
			append(layout)(text);
			let result;
			try {
				const response = await fetch(href);
				result = response.ok ? ok : no;
			} catch (error) {
				console.log(error);
				result = no;
			}
			remove(layout);
			append(layout)(result);
		});
		return layout;
	};

	const layoutLink = (href, { classList, content, ...options }) => {
		const link = $("a", {
			attr: { href, target: "_blank", },
			...classList && { classList },
			...content && { content },
			...options,
		});
		return link;
	};

	const layoutLinkedItem = (item, href, ...items) => {
		const link = layoutLink(href, { classList: ["group__link"] });
		return [ item, link, ...items ];
	};

	const layoutLab = (baseRepo, baseSite, group, student) => async (lab) => {
		const href = `${baseRepo}/tree/master/${group}/${student}/${lab}/`;
		const hrefDPF = `${baseRepo}/tree/master/${group}/${student}/${lab}/report.pdf`;
		const hrefDOC = `${baseRepo}/tree/master/${group}/${student}/${lab}/report.doc`;
		const hrefDOCX = `${baseRepo}/tree/master/${group}/${student}/${lab}/report.docx`;
		const checks = [
			layoutCheck(`${baseSite}/${group}/${student}/${lab}/report.pdf`, {
				title: 'check PDF',
				text: $('i', {
					attr: { alt: 'pdf', style: "color: grey;", },
					classList: ["far", "fa-file-pdf", "fa-1x"],
				}),
				ok: $('i', {
					attr: { alt: 'pdf', style: "color: green;", },
					classList: ["far", "fa-file-pdf", "fa-1x"],
				}),
				no: $('i', {
					attr: { alt: 'pdf', style: "color: red;", },
					classList: ["far", "fa-file-pdf", "fa-1x"],
				}),
				attr: { 'data-check': true, },
			}),
			layoutCheck(`${baseSite}/${group}/${student}/${lab}/report.doc`, {
				title: 'check DOC',
				text: $('i', {
					attr: { alt: 'doc', style: "color: grey;", },
					classList: ["far", "fa-file-alt", "fa-1x"],
				}),
				ok: $('i', {
					attr: { alt: 'doc', style: "color: green;", },
					classList: ["far", "fa-file-alt", "fa-1x"],
				}),
				no: $('i', {
					attr: { alt: 'doc', style: "color: red;", },
					classList: ["far", "fa-file-alt", "fa-1x"],
				}),
				attr: { 'data-check': true, },
			}),
			layoutCheck(`${baseSite}/${group}/${student}/${lab}/report.docx`, {
				title: 'check DOCX',
				text: $('i', {
					attr: { alt: 'docx', style: "color: grey;", },
					classList: ["far", "fa-file-word", "fa-1x"],
				}),
				ok: $('i', {
					attr: { alt: 'docx', style: "color: green;", },
					classList: ["far", "fa-file-word", "fa-1x"],
				}),
				no: $('i', {
					attr: { alt: 'docx', style: "color: red;", },
					classList: ["far", "fa-file-word", "fa-1x"],
				}),
				attr: { 'data-check': true, },
			}),
		];
		return $("li", {
			content: layoutLinkedItem(lab, href, ...checks),
		});
	};

	const layoutStudent = (baseRepo, baseSite, group) => async (student) => {
		const href = `${baseRepo}/tree/master/${group}/${student}/`;
		let labs = [ "lab1", "lab2", "lab3", "lab4", "lab5" ];
		labs = labs.map(layoutLab(baseRepo, baseSite, group, student));
		labs = await Promise.all(labs);
		labs = labs.filter(item => item);
		const checkAll = $('span', {
			attr: { title: 'check all labs', },
			classList: ["group__check"],
			content: $('i', {
				attr: { style: "font-size: 12px;", },
				classList: ["fas", "fa-check-square"],
			}),
		});
		const layout = $('div', {
			classList: [ "group__student" ],
			content: [
				$("h3", { content: layoutLinkedItem(student, href, checkAll), }),
				$("ol", { content: [ ...labs, ] }),
			],
		});
		checkAll.addEventListener('click', (event) => {
			for (const check of layout.querySelectorAll('[data-check="true"]')) {
				check.click();
			}
		});
		return layout;
	};

	const layoutGroup = async (baseRepo, baseSite, group, title, students, className) => {
		const href = `${baseRepo}/tree/master/${group}/`;
		students = students.map(layoutStudent(baseRepo, baseSite, group));
		students = await Promise.all(students);
		students = students.filter(item => item);
		const checkAll = $('span', {
			attr: { title: 'check all students', },
			classList: ["group__check"],
			content: $('i', {
				attr: { style: "font-size: 12px;", },
				classList: ["fa", "fa-check-square"],
			}),
		});
		const layout = $("section", {
			classList: ["group", className],
			content: [
				$("h2", { content: layoutLinkedItem(title, href, checkAll), }),
				...students,
			],
		});
		checkAll.addEventListener('click', (event) => {
			for (const check of layout.querySelectorAll('[data-check="true"]')) {
				check.click();
			}
		});
		return layout;
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
	groups = groups.map(async (file) => {
		try {
			const response = await fetch(`${baseSite}/docs/${file}`);
			return await response.json();
		} catch (error) {
			console.log(`File load ${file}: `, error);
			return false;
		}
	} );
	groups = await Promise.all(groups);
	groups = groups.filter(item => item);
	groups = groups.map(async (groupData) => {
		const { class: className, group, title, students, } = groupData;
		return await layoutGroup(baseRepo, baseSite, group, title, students, className);
	});
	groups = await Promise.all(groups);
	groups = groups.filter(item => item);


	const main = document.getElementById('main');
	for (const group of groups) {
		main.appendChild(group);
	}

});
