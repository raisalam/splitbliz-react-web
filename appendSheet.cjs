const fs = require('fs');
const path = require('path');
const p = path.join(process.cwd(), 'src/app/components/GroupDetail.tsx');
let code = fs.readFileSync(p, 'utf8');

const endTag = '    </div>\n  );\n}';
if(!code.includes(endTag)) { console.log('endTag not found'); process.exit(1); }

const sheetCode = `
      {/* Action Required / Approvals Bottom Sheet */}
      <AnimatePresence>
        {showApprovalSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowApprovalSheet(false)}
              className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="pt-4 pb-2 px-6 sticky top-0 bg-white dark:bg-slate-900 z-10">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Action Required
                  </h3>
                  <button onClick={() => setShowApprovalSheet(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Please review the following settlement requests to update your group balances.
                </p>
              </div>

              <div className="px-6 pb-12 pt-4 overflow-y-auto space-y-4">
                {incomingRequests.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">All caught up!</h3>
                    <p className="text-slate-500">You have no pending approvals right now.</p>
                    <button 
                      onClick={() => setShowApprovalSheet(false)}
                      className="mt-6 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  incomingRequests.map((req) => {
                    const fromM = getMember(req.fromUserPublicId);
                    return (
                      <motion.div
                        key={req.publicId}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {fromM?.avatarUrl && <img src={fromM.avatarUrl} className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-slate-900" alt="" />}
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-base">
                                {getMemberName(req.fromUserPublicId)} paid you
                              </p>
                              <p className="text-sm text-slate-500">{req.note || 'No note'} • {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                            </div>
                          </div>
                          <span className="font-bold text-xl text-slate-900 dark:text-white">{currencySymbol}{parseFloat(req.amount).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleApprove(req.publicId)}
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-bold transition-colors"
                          >
                            <Check className="w-4 h-4" /> Approve
                          </button>
                          <button 
                            onClick={() => handleReject(req.publicId)}
                            className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl text-sm font-bold transition-colors"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
`;

code = code.replace(endTag, sheetCode + '\n' + endTag);
fs.writeFileSync(p, code);
console.log('Done!');
