

	// 2. 初始化：加载默认联系人（第一个）的聊天记录
	const defaultContactId = 1;
	loadContactChat(defaultContactId);

	// 3. 联系人切换功能
	$('.contact-item').on('click', function() {
		const contactId = parseInt($(this).data('contact-id'));
		// 切换选中状态
		$('.contact-item').removeClass('active');
		$(this).addClass('active');

		// 加载当前联系人的聊天记录
		loadContactChat(contactId);

		// 更新聊天窗口头部信息
		const contact = getContactById(contactId);
		if (contact) {
			$('.chat-header .contact-name').text(contact.name);
			$('.chat-header .contact-avatar img').attr('src', contact.avatar);
			$('.chat-header .online-status')
				.removeClass('online offline')
				.addClass(contact.onlineStatus);
		}

		// 手机端：切换后隐藏联系人列表
		if ($(window).width() <= 768) {
			$('.contact-list').removeClass('show');
		}
	});

	// 4. 发送消息功能
	$('#sendBtn').on('click', sendMessage);
	$('#msgInput').on('keydown', function(e) {
		// 按Enter键发送消息
		if (e.keyCode === 13) {
			sendMessage();
		}
	});

	// 5. 手机端：联系人列表切换（点击头部显示/隐藏）
	if ($(window).width() <= 768) {
		// 头部添加“联系人”按钮
		$('.chat-topbar').prepend('<i class="fa fa-users contact-toggle"></i>');
		// 点击显示/隐藏联系人列表
		$('.contact-toggle').on('click', function() {
			$('.contact-list').toggleClass('show');
		});
	}

	// 窗口大小变化时，处理手机端适配
	$(window).on('resize', function() {
		if ($(window).width() > 768) {
			$('.contact-list').removeClass('show');
		}
	});


	// ---------------------- 工具函数 ----------------------
	/**
	 * 根据联系人ID获取联系人信息
	 * @param {number} contactId - 联系人ID
	 * @returns {object|null} 联系人信息
	 */
	function getContactById(contactId) {
		return chatData.contacts.find(contact => contact.contactId === contactId) || null;
	}

	/**
	 * 加载指定联系人的聊天记录
	 * @param {number} contactId - 联系人ID
	 */
	function loadContactChat(contactId) {
		const contact = getContactById(contactId);
		if (!contact || !contact.chatRecords) {
			$('#chatContent').html('<div class="system-msg">暂无聊天记录</div>');
			return;
		}

		// 清空聊天内容容器
		$('#chatContent').empty();

		// 遍历聊天记录，生成HTML
		contact.chatRecords.forEach(record => {
			let msgHtml = '';
			switch (record.type) {
				// 系统提示（日期）
				case 'system':
					msgHtml = `<div class="system-msg">${record.content}</div>`;
					break;
					// 接收的消息（对方发送）
				case 'received':
					msgHtml = `
                        <div class="msg-item received">
                            <div class="msg-avatar">
                                <img src="${record.avatar}" alt="${record.sender}头像">
                            </div>
                            <div class="msg-content">
                                <div class="msg-text">${record.content}</div>
                                <div class="msg-time">${record.time}</div>
                            </div>
                        </div>
                    `;
					break;
					// 发送的消息（我方发送）
				case 'sent':
					msgHtml = `
                        <div class="msg-item sent">
                            <div class="msg-content">
                                <div class="msg-text">${record.content}</div>
                                <div class="msg-time">${record.time}</div>
                            </div>
                            <div class="msg-avatar">
                                <img src="${record.avatar}" alt="${record.sender}头像">
                            </div>
                        </div>
                    `;
					break;
			}
			// 添加到聊天容器
			$('#chatContent').append(msgHtml);
		});

		// 滚动到底部，显示最新消息
		$('#chatContent').scrollTop($('#chatContent')[0].scrollHeight);
	}

	/**
	 * 发送消息（并更新到聊天记录）
	 */
	function sendMessage() {
		const msgInput = $('#msgInput');
		const msgText = msgInput.val().trim();

		// 空消息不发送
		if (!msgText) return;

		// 获取当前选中的联系人ID
		const activeContactId = parseInt($('.contact-item.active').data('contact-id'));
		const contact = getContactById(activeContactId);
		if (!contact) return;

		// 获取当前时间（格式：HH:MM）
		const now = new Date();
		const hour = now.getHours().toString().padStart(2, '0');
		const minute = now.getMinutes().toString().padStart(2, '0');
		const msgTime = `${hour}:${minute}`;

		// 构建发送的消息对象
		const sentMsg = {
			type: 'sent',
			sender: '我',
			avatar: 'https://picsum.photos/id/91/50/50',
			content: msgText,
			time: msgTime
		};

		// 1. 添加到页面聊天容器
		const sentMsgHtml = `
            <div class="msg-item sent">
                <div class="msg-content">
                    <div class="msg-text">${sentMsg.content}</div>
                    <div class="msg-time">${sentMsg.time}</div>
                </div>
                <div class="msg-avatar">
                    <img src="${sentMsg.avatar}" alt="${sentMsg.sender}头像">
                </div>
            </div>
        `;
		$('#chatContent').append(sentMsgHtml);
		$('#chatContent').scrollTop($('#chatContent')[0].scrollHeight);

		// 2. 更新JSON数据中的聊天记录（仅前端临时更新，实际项目需同步到后端）
		contact.chatRecords.push(sentMsg);

		// 清空输入框
		msgInput.val('');

		// 模拟对方回复（2秒后自动发送，实际项目需对接后端接口）
		setTimeout(() => {
			const replyTexts = [
				'好的，没问题～',
				'可以的，我们约个时间交易吧？',
				'我再考虑一下，稍后回复你～',
				'价格方面不能再少啦，已经很优惠了～'
			];
			const randomReply = replyTexts[Math.floor(Math.random() * replyTexts.length)];

			// 构建回复消息对象
			const replyMsg = {
				type: 'received',
				sender: contact.name.split('（')[0], // 提取联系人姓名（如“小李（23版高数教材）”→“小李”）
				avatar: contact.avatar,
				content: randomReply,
				time: msgTime
			};

			// 添加回复到页面
			const replyMsgHtml = `
                <div class="msg-item received">
                    <div class="msg-avatar">
                        <img src="${replyMsg.avatar}" alt="${replyMsg.sender}头像">
                    </div>
                    <div class="msg-content">
                        <div class="msg-text">${replyMsg.content}</div>
                        <div class="msg-time">${replyMsg.time}</div>
                    </div>
                </div>
            `;
			$('#chatContent').append(replyMsgHtml);
			$('#chatContent').scrollTop($('#chatContent')[0].scrollHeight);

			// 更新JSON数据中的聊天记录
			contact.chatRecords.push(replyMsg);

			// 更新左侧联系人的“最后一条消息”和“时间”
			$('.contact-item[data-contact-id="' + activeContactId + '"] .last-msg').text(randomReply);
			$('.contact-item[data-contact-id="' + activeContactId + '"] .contact-time').text(msgTime);
		}, 2000);
	}
});