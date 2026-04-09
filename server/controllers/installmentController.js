const Installment = require("../models/Installment");
const Policy = require("../models/Policy");
const sendEmail = require("../utils/sendEmail");

const {
  parseDateFlexible,
  monthsBetweenInclusiveMinusOne
} = require("../utils/dateUtils");

const {
  recalcLeftInvestmentAmount,
  assertUserOwnedByAdmin
} = require("../utils/investmentUtils");

exports.generateInstallments = async (req, res) => {

  try {

    const policy = await Policy.findById(req.params.policyId).populate("userId");

    if (!policy || policy.userId.adminId !== req.admin.id)
      return res.status(403).json({ message: "Unauthorized" });

    if (policy.installmentsGenerated)
      return res.status(400).json({
        message: "Installments already generated"
      });

    const startDate = parseDateFlexible(policy.policyOpendate);

    const endDate = parseDateFlexible(policy.PolicyCloseDate);

    const installments = [];

    for (const { monthName, year } of monthsBetweenInclusiveMinusOne(startDate, endDate)) {

      installments.push({
        userId: policy.userId._id,
        policyId: policy._id,
        month: monthName,
        year,
        amount: policy.monthlyAmount,
        paid: false
      });

    }

    await Installment.insertMany(installments);

    policy.installmentsGenerated = true;

    await policy.save();

    res.json({
      message: "Installments generated",
      count: installments.length
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.getPolicyInstallments = async (req, res) => {

  try {

    const installments = await Installment.find({
      policyId: req.params.policyId
    }).sort({ year: 1 });

    res.json(installments);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

exports.updateInstallment = async (req, res) => {
  try {
    const { amount, paid } = req.body;

    const installment = await Installment.findById(req.params.id);

    if (!installment)
      return res.status(404).json({ message: "Installment not found" });

    const user = await assertUserOwnedByAdmin(
      installment.userId,
      req.admin.id
    );

    if (!user)
      return res.status(403).json({ message: "Unauthorized" });

    // 🔹 Update installment
    if (amount !== undefined) installment.amount = amount;
    if (paid !== undefined) installment.paid = paid;

    await installment.save();

    // 🔹 Recalculate investment
    await recalcLeftInvestmentAmount(
      installment.userId,
      installment.policyId
    );

    // 🔹 Get policy
    const policy = await Policy.findById(installment.policyId);

    // 🔹 Get all installments of this policy
    const installments = await Installment.find({
      policyId: installment.policyId
    });

    const paidInstallments = installments.filter(i => i.paid);
    const pendingInstallments = installments.filter(i => !i.paid);

    const totalPendingAmount = pendingInstallments.reduce(
      (sum, i) => sum + i.amount,
      0
    );

    const allPaid = pendingInstallments.length === 0;

    // 🔹 Send Email
    if (paid) {
      if (allPaid) {
        // 🎉 POLICY COMPLETED EMAIL
        await sendEmail(
          user.email,
          "LICMaster - Policy Completed 🎉",
          `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaebed; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); color: #334155;">
            <div style="background-color: #1e3a8a; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px;">LICMaster</h1>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #10b981; margin-top: 0; font-size: 22px; text-align: center;">Policy Completed 🎉</h2>
              <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">Hello <strong>${user.firstName}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6;">Congratulations! Your policy for <strong>${policy.nameOfPolicyHolder}</strong> has been successfully completed. We are thrilled to share this milestone with you.</p>
              
              <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 32px 0; text-align: center;">
                <p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600;">Final Maturity Amount</p>
                <p style="margin: 12px 0 0; font-size: 36px; font-weight: 800; color: #1e3a8a;">₹${policy.maturityAmount}</p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6;">Thank you for trusting <strong>LICMaster</strong> with your investment journey. We look forward to securing your future endeavors.</p>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              &copy; ${new Date().getFullYear()} LICMaster. All rights reserved.<br/>
              <span style="font-size: 11px;">This is an automated message, please do not reply.</span>
            </div>
          </div>
          `
        );
      } else {
        // 💰 INSTALLMENT PAID EMAIL
        console.log("📩 Sending email to:", user.email); //ayi gyo mail jo tara ma moklavu baby ha baby mokle 6e ke mokli didho na moklavu lay taru email lakh agiya tishagandhi19@gmail.com
        
        await sendEmail(
          user.email,
          "LICMaster - Installment Paid ✅",
          `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaebed; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); color: #334155;">
            <div style="background-color: #1e3a8a; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px;">LICMaster</h1>
            </div>
            
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; background-color: #d1fae5; color: #047857; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">Payment Successful ✅</span>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${user.firstName}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6;">We have successfully received your installment payment for <strong>${installment.month} ${installment.year}</strong>.</p>
              
              <div style="margin: 32px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc;">
                  <tr>
                    <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 15px;">Amount Paid</td>
                    <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; text-align: right; color: #10b981; font-size: 16px;">₹${installment.amount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 15px; background-color: #ffffff;">Remaining Installments</td>
                    <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right; background-color: #ffffff; font-size: 15px;">${pendingInstallments.length}</td>
                  </tr>
                  <tr>
                    <td style="padding: 16px; color: #64748b; font-size: 15px;">Total Pending Amount</td>
                    <td style="padding: 16px; font-weight: 700; text-align: right; color: #f43f5e; font-size: 16px;">₹${totalPendingAmount}</td>
                  </tr>
                </table>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6;">Thank you for keeping your investments on track with <strong>LICMaster</strong>.</p>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              &copy; ${new Date().getFullYear()} LICMaster. All rights reserved.<br/>
              <span style="font-size: 11px;">This is an automated message, please do not reply.</span>
            </div>
          </div>
          `
        );
      }
    }
    
    console.log("✅ Email function called");
    res.json(installment);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
 

exports.deletePolicyInstallments = async (req, res) => {

  try {

    const policy = await Policy.findById(req.params.policyId).populate("userId");

    if (!policy || policy.userId.adminId !== req.admin.id)
      return res.status(403).json({ message: "Unauthorized" });

    await Installment.deleteMany({
      policyId: req.params.policyId
    });

    policy.installmentsGenerated = false;

    await policy.save();

    await recalcLeftInvestmentAmount(
      policy.userId._id,
      policy._id
    );

    res.json({
      message: "All installments deleted"
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};