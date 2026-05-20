const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');

router.post('/invite',teamController.inviteMember);
router.get('/invites',teamController.getPendingInvites);
router.post('/invites/:id/resend',teamController.resendInvite);
router.delete('/invites/:id',teamController.cancelInvite);
router.post('/accept-invite/:token', teamController.acceptInvite);
router.get('/activity',teamController.getActivityLogs);
router.get('/workload',teamController.getWorkload);
router.get('/audit-logs',teamController.getAuditLogs);
router.route('/').get(teamController.getAllMembers).post(teamController.createMember);
router.route('/:id').get(teamController.getMemberById).patch(teamController.updateMember).delete(teamController.removeMember);

module.exports = router;