import { ComplaintService } from './src/services/complaint.service';

async function run() {
  try {
    const res = await ComplaintService.updateStatus(181, 'approved', 'dummy-admin', 'admin', 'Test petition');
    console.log('Success:', res);
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
