import { NextPage } from "next";
import StateStepView from "components/admin/stateDefinition/step/view";
import Layout from "components/layout";
import Protect from "components/auth/protect";
import { useRouter } from "next/router";
import Spinner from "components/widgets/spinner";

const AdminStateStepViewPage: NextPage = () => {
  const router = useRouter();
  const { step_id } = router.query;
  if (!step_id) {
    return <Spinner />;
  }
  return (
    <Protect>
      <Layout>
        <StateStepView />
      </Layout>
    </Protect>
  );
};

export default AdminStateStepViewPage;
