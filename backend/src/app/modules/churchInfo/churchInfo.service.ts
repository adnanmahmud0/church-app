import { IChurchInfo } from './churchInfo.interface';
import { ChurchInfo } from './churchInfo.model';

const defaultChurchInfo: Partial<IChurchInfo> = {
  content: `<h2>Our History</h2>
<p>Founded with a vision to connect people globally, our journey began as a small community initiative. Over the years, we have grown into a platform that empowers individuals through technology and compassion. Our history is a testament to the dedication of our community and the relentless pursuit of our mission.</p>
<h2>Our Mission</h2>
<p>To empower individuals and communities to grow, connect, and thrive together.</p>
<h2>Core Values</h2>
<ul>
<li><strong>Integrity:</strong> We believe in doing the right thing, even when no one is watching.</li>
<li><strong>Compassion:</strong> We care about the well-being of our community and strive to make a positive impact.</li>
<li><strong>Innovation:</strong> We continuously seek new ways to improve and provide the best experience.</li>
<li><strong>Excellence:</strong> We set high standards for ourselves and are committed to achieving them.</li>
</ul>`,
  updated_by: "System Initializer"
};

const getChurchInfo = async () => {
  let info = await ChurchInfo.findOne();
  
  if (!info) {
    info = await ChurchInfo.create(defaultChurchInfo);
  }
  
  return info;
};

const updateChurchInfo = async (payload: Partial<IChurchInfo>, adminName: string) => {
  payload.updated_at = new Date();
  payload.updated_by = adminName;
  
  const existing = await ChurchInfo.findOne();
  
  if (existing) {
    return await ChurchInfo.findByIdAndUpdate(existing._id, payload, { new: true, runValidators: true });
  } else {
    return await ChurchInfo.create(payload);
  }
};

export const ChurchInfoService = {
  getChurchInfo,
  updateChurchInfo,
};
