import PQueue from 'p-queue';

export const normalApiQueue = new PQueue({
	interval: 1000,
	intervalCap: 1,
	carryoverIntervalCount: true
});

export const skinApiQueue = new PQueue({
	interval: 1000,
	intervalCap: 40,
	carryoverIntervalCount: true
});

normalApiQueue.on('add', () => {
	console.log(`Task added. Queue size: ${normalApiQueue.size}  Pending: ${normalApiQueue.pending}`);
});

skinApiQueue.on('add', () => {
	console.log(`Task added. Queue size: ${skinApiQueue.size}  Pending: ${skinApiQueue.pending}`);
});
