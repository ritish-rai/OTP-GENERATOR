const users = require("../models/userSchema");
const userotp = require("../models/userOtp");
const nodemailer = require("nodemailer");

// email config
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
});

exports.userregister = async (req, res) => {
    const { fname, email, password } = req.body;

    if (!fname || !email || !password) {
        return res.status(400).json({ error: "Please Enter All Input Data" });
    }

    try {
        const presuer = await users.findOne({ email: email });

        if (presuer) {
            return res.status(400).json({ error: "This User Already exists in our DB" });
        } else {
            const userregister = new users({
                fname, email, password
            });

            // here password hashing

            const storeData = await userregister.save();
            return res.status(200).json(storeData);
        }
    } catch (error) {
        return res.status(400).json({ error: "Invalid Details", details: error.message });
    }
};

// user send otp
exports.userOtpSend = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Please Enter Your Email" });
    }

    try {
        const presuer = await users.findOne({ email: email });

        if (presuer) {
            const OTP = Math.floor(100000 + Math.random() * 900000);

            const existEmail = await userotp.findOne({ email: email });

            if (existEmail) {
                const updateData = await userotp.findByIdAndUpdate(
                    { _id: existEmail._id },
                    { otp: OTP },
                    { new: true }
                );
                await updateData.save();

                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: "Sending Email For OTP Validation",
                    text: `OTP: ${OTP}`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log("Error:", error);
                        return res.status(400).json({ error: "Email not sent" });
                    } else {
                        console.log("Email sent:", info.response);
                        return res.status(200).json({ message: "Email sent Successfully" });
                    }
                });

            } else {

                const saveOtpData = new userotp({
                    email, otp: OTP
                });

                await saveOtpData.save();
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: "Sending Email For OTP Validation",
                    text: `OTP: ${OTP}`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log("Error:", error);
                        return res.status(400).json({ error: "Email not sent" });
                    } else {
                        console.log("Email sent:", info.response);
                        return res.status(200).json({ message: "Email sent Successfully" });
                    }
                });
            }
        } else {
            return res.status(400).json({ error: "This User does not exist in our DB" });
        }
    } catch (error) {
        return res.status(400).json({ error: "Invalid Details", details: error.message });
    }
};
exports.userLogin=async(req,res)=>{
    const {email,otp}=req.body
    if(!otp||!email){
        return res.status(400).json({ error: "Please Enter Your Otp and Email" });
    }
    try{
        const otpverification=await userotp.findOne({email:email});
        if(otpverification.otp==otp){
            const presuer=await users.findOne({email:email});
            const token =await presuer.generateAuthtoken();
            console.log(token);
            res.status(200).json({message:"User Login Successfully Done",userToken:token});

        }else{
            return res.status(400).json({ error: "Invalid Otp" });
        }

    }catch(error){
        
        return res.status(400).json({ error: "Invalid Details", details: error.message });

    }
}