var PCMS = function(filePath, containerElement) {
	var get = function(url, callback) {
		try {
			var async = true;
			var x = new(this.XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
			x.open('GET', url, async);
			x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			x.onreadystatechange = function() {
				x.readyState > 3 && callback && callback(x.responseText);
			};
			x.send(null);
		} catch (e) {
			window.console && console.log(e);
		}
	};

	var TreeNode = function(contentStr) {
		var content = contentStr;
		var children = [];
		this.getContent = function() {
			return content;
		};
		this.addChild = function(node) {
			children.push(node);
		};
		this.getChild = function(idx) {
			return children[idx] || null;
		};
		this.children = function() {
			return children.length;
		};
	};

	var Tree = function(treeStr) {
		var title = new TreeNode('If you are seeing this, your master file is empty');
		var treeList = treeStr.split(/\r?\n/);
		if (treeList.length > 0) {
			title = new TreeNode(treeList.shift());
			document.title = title.getContent();
			for (var i = 0; i < treeList.length; i++) {
				if (treeList[i].length !== 0) {
					var topic = new TreeNode(treeList[i]);
					while (++i < treeList.length) {
						if (treeList[i].length === 0) {
							break;
						}
						var argumentFilter = /(\S)+(\.|\?|\!)+(\S)*(\s)+(\S)/g;
						if (argumentFilter.exec(treeList[i]) !== null) {
							var filterIndex = argumentFilter.lastIndex;
							var argument = new TreeNode(treeList[i].substring(0, filterIndex - 2));
							var support = new TreeNode(treeList[i].substring(filterIndex - 1))
							argument.addChild(support);
							topic.addChild(argument);
						} else {
							var argument = new TreeNode(treeList[i]);
							topic.addChild(argument);
						}

					}
					title.addChild(topic);
				}
			}
		}
		this.root = title;
	};

	var toggle = function(childContainer) {
		if (childContainer.className == 'hide') {
			childContainer.className = 'show';
			var position = childContainer.getBoundingClientRect();
			var viewportHeight = (window.innerHeight || document.documentElement.clientHeight)
			if (position.bottom > viewportHeight) {
				childContainer.scrollIntoView(false);
			}
		} else if (childContainer.className == 'show') {
			childContainer.className = 'hide';
		}
	}

	var render = function(parentContainer, node) {
		var content = document.createElement('a');
		content.innerHTML = node.getContent();

		var childContainer = document.createElement('div');
		for (var i = 0; i < node.children(); i++) {
			render(childContainer, node.getChild(i));
		}
		if (node.children() > 0) {
			childContainer.className = 'hide';
			content.addEventListener('click', function() {
				var selectedText = '';
				if (window.getSelection) {
					selectedText = window.getSelection().toString();
				} else if (document.selection && document.selection.type != 'Control') {
					selectedText = document.selection.createRange().text;
				}
				if (selectedText.length === 0) {
					toggle(childContainer);
				}
			});
			content.addEventListener('dblclick', function(e) {
				toggle(childContainer);
			});
		}

		parentContainer.appendChild(content);
		parentContainer.appendChild(childContainer);
	};

	get(filePath, function(responseText) {
		var tree = new Tree(responseText);
		render(containerElement, tree.root);
	});
};
