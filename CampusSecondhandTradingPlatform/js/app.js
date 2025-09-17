// 确保DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
	// 获取所有切换按钮和登录表单
	const switchItems = document.querySelectorAll('.switch-item');
	const loginForms = document.querySelectorAll('.login-form');

	// 给每个切换按钮添加点击事件
	switchItems.forEach(item => {
		item.addEventListener('click', function() {
			// 获取目标登录类型
			const targetType = this.getAttribute('data-type');

			// 更新按钮激活状态
			switchItems.forEach(btn => btn.classList.remove('active'));
			this.classList.add('active');

			// 更新表单显示状态
			loginForms.forEach(form => {
				form.classList.remove('active');
				// 显示对应类型的表单
				if (form.classList.contains(`${targetType}-login`)) {
					form.classList.add('active');
				}
			});
		});
	});
});
// 渲染商品卡片
function renderProducts(products, containerId) {
	const container = document.getElementById(containerId);

	products.forEach(product => {
		const productCard = document.createElement('div');
		productCard.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
		productCard.innerHTML = `
						<div class="product-card">
							<div class="product-img">
								<img src="${product.image}" alt="${product.title}">
								${product.discount ? `<span class="product-discount">${product.discount}</span>` : ''}
							</div>
							<div class="product-info">
								<h5 class="product-title">${product.title}</h5>
								<div class="product-meta">
									<span>${product.location}</span>
									<span>${product.postTime}</span>
								</div>
								<div class="product-price">
									<span>¥${product.price}<span class="original-price">¥${product.originalPrice}</span></span>
									<button class="add-to-cart" data-id="${product.id}">
										<i class="fa fa-shopping-cart"></i>
									</button>
								</div>
							</div>
						</div>
					`;
		container.appendChild(productCard);
	});

	// 为购物车按钮添加事件
	addToCartEvents();
}

// 添加到购物车事件
function addToCartEvents() {
	const addButtons = document.querySelectorAll('.add-to-cart');
	addButtons.forEach(button => {
		button.addEventListener('click', function(e) {
			e.preventDefault();
			const productId = this.getAttribute('data-id');
			// 这里可以添加实际的购物车逻辑
			this.innerHTML = '<i class="fa fa-check"></i>';
			setTimeout(() => {
				this.innerHTML = '<i class="fa fa-shopping-cart"></i>';
			}, 1500);
			alert('商品已加入购物车！');
		});
	});
}

// 1. 渲染商品卡片（适配 HTML 中的 product-container 容器）
function renderProducts(products) {
	// 获取 HTML 中已有的商品容器（id="product-container"）
	const container = document.getElementById('product-container');
	if (!container) return; // 防止容器不存在导致报错

	products.forEach(product => {
		// 创建 Bootstrap 网格列（与 HTML 中卡片布局一致）
		const col = document.createElement('div');
		col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4'; // 适配不同屏幕的列数

		// 商品卡片内容（与你原设计的卡片结构一致）
		col.innerHTML = `
      <div class="product-card">
        <div class="product-img">
          <img src="${product.image}" alt="${product.title}" class="d-block w-100">
          ${product.discount ? `<span class="product-discount">${product.discount}</span>` : ''}
        </div>
        <div class="product-info p-3">
          <h5 class="product-title text-truncate" style="max-height: 48px; overflow: hidden;">
            ${product.title}
          </h5>
          <div class="product-meta text-muted small mt-2">
            <span><i class="fa fa-map-marker mr-1"></i>${product.location}</span>
            <span class="ml-3"><i class="fa fa-clock-o mr-1"></i>${product.postTime}</span>
          </div>
          <div class="product-price mt-3 d-flex justify-content-between align-items-center">
            <span class="text-danger font-weight-bold">¥${product.price}</span>
            ${product.originalPrice ? `<span class="text-muted small text-line-through">¥${product.originalPrice}</span>` : ''}
            <button class="add-to-cart btn btn-sm btn-warning rounded-circle" data-id="${product.id}">
              <i class="fa fa-shopping-cart"></i>
            </button>
          </div>
        </div>
      </div>
    `;

		container.appendChild(col);
	});

	// 绑定购物车按钮事件（点击添加反馈）
	bindAddToCartEvent();
}

// 2. 购物车按钮点击事件（增强交互）
function bindAddToCartEvent() {
	const buttons = document.querySelectorAll('.add-to-cart');
	buttons.forEach(btn => {
		btn.addEventListener('click', function(e) {
			e.preventDefault();
			const productId = this.getAttribute('data-id');
			// 临时切换图标反馈
			this.innerHTML = '<i class="fa fa-check"></i>';
			this.classList.remove('btn-warning');
			this.classList.add('btn-success');
			// 1.5秒后恢复原样式
			setTimeout(() => {
				this.innerHTML = '<i class="fa fa-shopping-cart"></i>';
				this.classList.remove('btn-success');
				this.classList.add('btn-warning');
			}, 1500);
			alert(`商品（ID: ${productId}）已加入购物车！`);
		});
	});
}

// 3. 核心逻辑：读取 app.json 数据并初始化页面
document.addEventListener('DOMContentLoaded', function() {
	// 读取同目录下的 app.json 文件
	fetch('../json/app.json')
		.then(response => {
			// 检查文件是否成功加载（避免 404/500 错误）
			if (!response.ok) {
				throw new Error(`数据加载失败：${response.status}（可能是 app.json 路径错误）`);
			}
			// 将 JSON 字符串解析为 JS 对象
			return response.json();
		})
		.then(data => {
			// 初始化：渲染“推荐商品”（对应 app.json 中的 productsData）
			renderProducts(data.productsData);

			// 绑定“加载更多”按钮事件（HTML 中 id="load-more"）
			const loadMoreBtn = document.getElementById('load-more');
			if (loadMoreBtn) {
				loadMoreBtn.addEventListener('click', function() {
					// 渲染更多商品（对应 app.json 中的 moreProductsData）
					renderProducts(data.moreProductsData);
					// 禁用按钮并修改文案（避免重复点击）
					this.disabled = true;
					this.innerHTML = '已加载全部商品 <i class="fa fa-check"></i>';
					this.classList.add('opacity-70');
				});
			}
		})
		.catch(error => {
			// 捕获错误并提示用户（如路径错误、JSON 语法错误）
			console.error('错误详情：', error);
			const container = document.getElementById('product-container');
			if (container) {
				container.innerHTML = `
          <div class="col-12 text-center py-5 text-danger">
            <i class="fa fa-exclamation-circle fa-2x mb-3"></i>
            <p>商品数据加载失败，请检查 app.json 文件路径是否正确</p>
          </div>
        `;
			}
		});
});