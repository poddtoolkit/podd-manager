import { NextPage } from "next";
import AuthorityUpdate from "components/admin/authority/update";
import Layout from "components/layout";
import Protect from "components/auth/protect";
import Breadcrumb from "components/layout/breadcrumb";
import { useRouter } from "next/router";
import Spinner from "components/widgets/spinner";

const AdminAuthorityUpdatePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  if (!id) {
    return <Spinner />;
  }

  return (
    <Protect>
      <Layout>
        <Breadcrumb
          crumbs={[
            { text: "Authorities", href: "/admin/authorities" },
            { text: "Update" },
          ]}
        />
        <AuthorityUpdate />
      </Layout>
    </Protect>
  );
};

export default AdminAuthorityUpdatePage;
