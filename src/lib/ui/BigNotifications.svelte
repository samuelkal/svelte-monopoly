<script>
	let { notifications = [], onRemoveNotification } = $props();
	let currentNotification = $state(null);
	let animationPhase = $state('hidden');
	let activeNotificationId = null;
	let visibleTimerId = null;
	let autoCloseTimerId = null;
	let hideTimerId = null;

	function clearTimers() {
		if (visibleTimerId) {
			clearTimeout(visibleTimerId);
			visibleTimerId = null;
		}
		if (autoCloseTimerId) {
			clearTimeout(autoCloseTimerId);
			autoCloseTimerId = null;
		}
		if (hideTimerId) {
			clearTimeout(hideTimerId);
			hideTimerId = null;
		}
	}

	function removeCurrentNotification() {
		if (!currentNotification) {
			return;
		}
		clearTimers();
		const notificationId = currentNotification.id;
		if (typeof onRemoveNotification === 'function') {
			onRemoveNotification(notificationId);
		}
		animationPhase = 'hidden';
		currentNotification = null;
		activeNotificationId = null;
	}

	function handleClose() {
		if (!currentNotification) {
			return;
		}
		animationPhase = 'exiting';
		setTimeout(() => {
			removeCurrentNotification();
		}, 380);
	}

	$effect(() => {
		const list = notifications;

		if (!list || list.length === 0) {
			clearTimers();
			animationPhase = 'hidden';
			currentNotification = null;
			activeNotificationId = null;
			return;
		}

		const notification = list[0];
		if (activeNotificationId === notification.id) {
			return;
		}

		clearTimers();
		activeNotificationId = notification.id;
		currentNotification = notification;
		animationPhase = 'entering';

		visibleTimerId = setTimeout(() => {
			animationPhase = 'visible';
		}, 260);

		if (notification.duration > 0) {
			autoCloseTimerId = setTimeout(() => {
				animationPhase = 'exiting';
				hideTimerId = setTimeout(() => {
					removeCurrentNotification();
				}, 380);
			}, notification.duration);
		}
	});
</script>

{#if currentNotification}
	<div class={`notification-backdrop ${animationPhase}`}></div>
	<div class={`notification-popup ${animationPhase}`}>
		<button onclick={handleClose} class="notification-close-btn">×</button>
		<div class="notification-icon">{currentNotification.icon}</div>
		<div class="notification-title">{currentNotification.title}</div>
		<div class="notification-description">{currentNotification.description}</div>
	</div>
{/if}

<style>
	.notification-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(2px);
		z-index: 70;
		opacity: 0;
		transition: opacity 0.35s ease;
		pointer-events: none;
	}

	.notification-popup {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) scale(0.82);
		width: min(92vw, 520px);
		padding: 22px;
		border-radius: 18px;
		background: linear-gradient(145deg, #111827 0%, #1f2937 100%);
		border: 1px solid rgba(250, 204, 21, 0.55);
		box-shadow: 0 24px 56px rgba(0, 0, 0, 0.45);
		color: #f9fafb;
		text-align: center;
		z-index: 80;
		opacity: 0;
		pointer-events: auto;
		transition:
			opacity 0.35s ease,
			transform 0.35s ease;
	}

	.notification-backdrop.entering,
	.notification-backdrop.visible {
		opacity: 1;
	}

	.notification-popup.entering,
	.notification-popup.visible {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1);
	}

	.notification-popup.exiting,
	.notification-backdrop.exiting {
		opacity: 0;
		transform: translate(-50%, -50%) scale(0.88);
	}

	.notification-close-btn {
		position: absolute;
		top: 8px;
		right: 10px;
		width: 30px;
		height: 30px;
		border-radius: 999px;
		border: 1px solid rgba(250, 204, 21, 0.6);
		background: rgba(255, 255, 255, 0.08);
		color: #fef3c7;
		font-size: 16px;
		cursor: pointer;
		pointer-events: auto;
		z-index: 100;
	}

	.notification-icon {
		font-size: 48px;
		font-weight: 800;
		margin-bottom: 8px;
		color: #fde68a;
	}

	.notification-title {
		font-size: 28px;
		line-height: 1.2;
		font-weight: 800;
		margin-bottom: 8px;
	}

	.notification-description {
		font-size: 18px;
		line-height: 1.4;
		color: #d1d5db;
	}

	.notification-manual-instruction {
		margin-top: 16px;
		font-size: 14px;
		color: #fcd34d;
	}
</style>
