<script>
	import { goto } from '$app/navigation';

	let isConfirmBusy: boolean;
	let isRetrieveBusy: boolean;
	let principalInput: string;

	const handlePrincipalInputChange = async () => {
		if (!$canisters || $sns.name !== 'Custom') return;

		const filteredInput = principalInput.replace(/\s+/g, '');
		const shouldChange = isPrincipalValid(filteredInput);
		if (shouldChange) {
			await handleSnsChange('Custom', filteredInput);
		}
	};

	const notifyIcpDeposit = async () => {
		if ($isBusy || !$canisters || !isPrincipalValid($sns.principal)) return;
		try {
			isBusy.set(true);
			isConfirmBusy = true;
			const boomerangResult = await $canisters.boomerang.notify_icp_deposit(
				Principal.fromText($sns.principal)
			);
			const result = handleSnsIcpDepositResult(boomerangResult);
			if (result.success) {
				toasts.add(Toast.success(result.message));
			} else {
				toasts.add(Toast.error(result.message));
			}
		} catch (error) {
			console.log(error);
			toasts.add(Toast.error('Notify ICP deposit call failed, please retry.'));
		}
		isBusy.set(false);
		isConfirmBusy = false;
	};

	async function retrieveNicp() {
		if ($isBusy || !$canisters || !isPrincipalValid($sns.principal)) return;
		try {
			isBusy.set(true);
			isRetrieveBusy = true;
			const retrieveResult = await $canisters.boomerang.retrieve_nicp(
				Principal.fromText($sns.principal)
			);
			const result = await handleSnsRetrieveNicpResult(retrieveResult);
			if (result.success) {
				toasts.add(Toast.success(result.message));
			} else {
				toasts.add(Toast.error(result.message));
			}
		} catch (error) {
			console.log(error);
			toasts.add(Toast.error('Retrieve nICP call failed, please retry.'));
		}
		isBusy.set(false);
		isRetrieveBusy = false;
	}

	let isAnimating = false;
	let isCircleOwnerVisible = false;
	let isCircleSubaccountVisible = false;

	const handleAnimation = (target: 'owner' | 'subaccount') => {
		if (!isAnimating) {
			isAnimating = true;
			isCircleOwnerVisible = target === 'owner';
			isCircleSubaccountVisible = target === 'subaccount';
			setTimeout(() => {
				isCircleOwnerVisible = false;
				isCircleSubaccountVisible = false;
				setTimeout(() => {
					isAnimating = false;
				}, 500);
			}, 500);
		}
	};
</script>
