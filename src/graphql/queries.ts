import { gql } from '@apollo/client';

export const FETCH_SERVICES_QUERY = gql`
  query FetchServices($filter: FetchServicesInput) {
    fetchServices(filter: $filter) {
      id
      title
      slug
      summary
      description
      priceFrom
      city
      state
      coverImageUrl
      galleryUrls
      serviceDate
      status
      approvalStatus
      ratingAverage
      totalReviews
      vendor {
        id
        businessName
        slug
        city
        state
        isVerified
      }
      category {
        id
        name
        slug
      }
    }
  }
`;

export const SERVICE_CATEGORIES_QUERY = gql`
  query ServiceCategories {
    serviceCategories {
      id
      name
      slug
    }
  }
`;

export const SERVICE_BY_SLUG_QUERY = gql`
  query ServiceBySlug($slug: String!) {
    serviceBySlug(slug: $slug) {
      id
      title
      slug
      summary
      description
      priceFrom
      city
      state
      coverImageUrl
      galleryUrls
      serviceDate
      durationHours
      guestCapacity
      status
      approvalStatus
      ratingAverage
      totalReviews
      category {
        name
        slug
      }
      vendor {
        id
        businessName
        slug
        city
        state
        description
        ratingAverage
        totalReviews
        isVerified
      }
    }
  }
`;

export const SERVICE_REVIEWS_QUERY = gql`
  query ServiceReviews($serviceId: String!) {
    serviceReviews(serviceId: $serviceId) {
      id
      rating
      comment
      createdAt
      user {
        id
        fullName
      }
    }
  }
`;

export const VENDOR_PROFILE_QUERY = gql`
  query VendorProfile($vendorId: String!) {
    fetchVendorProfile(vendorId: $vendorId) {
      id
      businessName
      slug
      description
      city
      state
      isVerified
      ratingAverage
      totalReviews
      availability {
        id
        startAt
        endAt
        label
        isBlocked
      }
      owner {
        fullName
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        fullName
        role
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        fullName
        role
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      fullName
      email
      username
      phone
      role
      isActive
    }
  }
`;

export const MY_WISHLIST_QUERY = gql`
  query MyWishlist {
    myWishlist {
      id
      title
      slug
      priceFrom
      city
      coverImageUrl
      vendor {
        businessName
      }
      category {
        name
      }
    }
  }
`;

export const FETCH_BOOKINGS_QUERY = gql`
  query FetchBookingDetails {
    fetchBookingDetails {
      id
      status
      eventDate
      createdAt
      updatedAt
      guestCount
      venue
      notes
      totalAmount
      user {
        id
        fullName
        email
      }
      service {
        id
        title
        slug
        coverImageUrl
        city
        category {
          id
          name
          slug
        }
      }
      vendor {
        id
        businessName
        city
        state
      }
      payment {
        id
        amount
        status
        payoutStatus
        razorpayOrderId
        razorpayPaymentId
        paidAt
      }
      review {
        id
        rating
        comment
      }
    }
  }
`;

export const MY_VENDOR_PROFILE_QUERY = gql`
  query MyVendorProfile {
    myVendorProfile {
      id
      businessName
      slug
      city
      state
      description
      approvalStatus
      isVerified
      ratingAverage
      totalReviews
      createdAt
      updatedAt
      availability {
        id
        startAt
        endAt
        label
      }
    }
  }
`;

export const MY_VENDOR_SERVICES_QUERY = gql`
  query MyVendorServices {
    myVendorServices {
      id
      title
      slug
      summary
      description
      status
      approvalStatus
      priceFrom
      city
      state
      durationHours
      guestCapacity
      coverImageUrl
      isFeatured
      totalReviews
      ratingAverage
      createdAt
      updatedAt
      serviceDate
      category {
        name
        slug
      }
    }
  }
`;

export const ADMIN_ANALYTICS_QUERY = gql`
  query FetchAdminAnalytics {
    fetchAdminAnalytics {
      totalUsers
      totalVendors
      approvedVendors
      totalServices
      totalBookings
      pendingBookings
      totalRevenue
      paidRevenue
    }
  }
`;

export const ADMIN_USERS_QUERY = gql`
  query AdminUsers {
    adminUsers {
      id
      fullName
      email
      username
      phone
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const ADMIN_VENDORS_QUERY = gql`
  query AdminVendors {
    adminVendors {
      id
      businessName
      city
      state
      approvalStatus
      isVerified
      ratingAverage
      totalReviews
      createdAt
      updatedAt
      owner {
        fullName
        email
        phone
      }
    }
  }
`;

export const ADMIN_BOOKINGS_QUERY = gql`
  query AdminBookings {
    adminBookings {
      id
      status
      eventDate
      createdAt
      updatedAt
      totalAmount
      venue
      guestCount
      notes
      user {
        id
        fullName
        email
      }
      vendor {
        id
        businessName
        city
        state
      }
      service {
        id
        title
        slug
        category {
          name
          slug
        }
      }
      payment {
        id
        amount
        status
        payoutStatus
      }
    }
  }
`;

export const ADMIN_PAYMENTS_QUERY = gql`
  query AdminPayments {
    adminPayments {
      id
      amount
      status
      payoutStatus
      provider
      razorpayOrderId
      razorpayPaymentId
      transactionReference
      paidAt
      createdAt
      updatedAt
    }
  }
`;

export const ADMIN_SERVICES_QUERY = gql`
  query AdminServices {
    adminServices {
      id
      title
      slug
      summary
      description
      status
      approvalStatus
      priceFrom
      city
      state
      serviceDate
      durationHours
      guestCapacity
      coverImageUrl
      isFeatured
      totalReviews
      ratingAverage
      createdAt
      updatedAt
      vendor {
        id
        businessName
        approvalStatus
        city
        state
      }
      category {
        id
        name
        slug
      }
    }
  }
`;

export const ADMIN_CMS_QUERY = gql`
  query AdminCmsPages {
    adminCmsPages {
      id
      slug
      title
      excerpt
      body
      isPublished
      updatedAt
    }
  }
`;

export const CREATE_BOOKING_MUTATION = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      status
      eventDate
      venue
      totalAmount
    }
  }
`;

export const CANCEL_BOOKING_MUTATION = gql`
  mutation CancelBooking($bookingId: String!, $reason: String) {
    cancelBooking(bookingId: $bookingId, reason: $reason) {
      id
      status
      notes
    }
  }
`;

export const RESCHEDULE_BOOKING_MUTATION = gql`
  mutation RescheduleBooking($input: RescheduleBookingInput!) {
    rescheduleBooking(input: $input) {
      id
      status
      eventDate
      venue
      guestCount
      notes
    }
  }
`;

export const TOGGLE_WISHLIST_MUTATION = gql`
  mutation ToggleWishlist($serviceId: String!) {
    toggleWishlist(serviceId: $serviceId) {
      id
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      fullName
      username
      phone
    }
  }
`;

export const INITIATE_PAYMENT_MUTATION = gql`
  mutation InitiatePayment($input: InitiatePaymentInput!) {
    initiatePayment(input: $input) {
      id
      amount
      status
      razorpayOrderId
      transactionReference
    }
  }
`;

export const VERIFY_PAYMENT_MUTATION = gql`
  mutation VerifyPayment($input: VerifyPaymentInput!) {
    verifyPayment(input: $input) {
      id
      status
      razorpayOrderId
      razorpayPaymentId
      paidAt
    }
  }
`;

export const SUBMIT_REVIEW_MUTATION = gql`
  mutation SubmitReview($input: SubmitReviewInput!) {
    submitReview(input: $input) {
      id
      rating
      comment
      createdAt
    }
  }
`;

export const CREATE_SERVICE_MUTATION = gql`
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      id
      title
      status
      approvalStatus
      priceFrom
      city
    }
  }
`;

export const UPDATE_SERVICE_MUTATION = gql`
  mutation UpdateService($input: UpdateServiceInput!) {
    updateService(input: $input) {
      id
      title
      summary
      description
      status
      approvalStatus
      priceFrom
      city
      state
      coverImageUrl
      category {
        name
        slug
      }
    }
  }
`;

export const DELETE_SERVICE_MUTATION = gql`
  mutation DeleteService($serviceId: String!) {
    deleteService(serviceId: $serviceId) {
      id
      status
    }
  }
`;

export const UPDATE_BOOKING_STATUS_MUTATION = gql`
  mutation UpdateBookingStatus($input: UpdateBookingStatusInput!) {
    updateBookingStatus(input: $input) {
      id
      status
      notes
    }
  }
`;

export const UPSERT_VENDOR_AVAILABILITY_MUTATION = gql`
  mutation UpsertVendorAvailability($input: UpsertAvailabilityInput!) {
    upsertVendorAvailability(input: $input) {
      id
      availability {
        id
        startAt
        endAt
        label
      }
    }
  }
`;

export const APPROVE_VENDOR_MUTATION = gql`
  mutation ApproveVendor($input: ApproveVendorInput!) {
    approveVendor(input: $input) {
      id
      approvalStatus
      isVerified
    }
  }
`;

export const CREATE_VENDOR_ACCOUNT_MUTATION = gql`
  mutation CreateVendorAccount($input: RegisterInput!) {
    createVendorAccount(input: $input) {
      id
      businessName
      slug
      city
      state
      approvalStatus
      isVerified
      owner {
        id
        fullName
        email
      }
    }
  }
`;

export const UPDATE_USER_ROLE_MUTATION = gql`
  mutation UpdateUserRole($input: UpdateUserRoleInput!) {
    updateUserRole(input: $input) {
      id
      role
    }
  }
`;

export const ADMIN_CREATE_SERVICE_MUTATION = gql`
  mutation AdminCreateService($vendorId: String!, $input: CreateServiceInput!) {
    adminCreateService(vendorId: $vendorId, input: $input) {
      id
      title
      status
      approvalStatus
      priceFrom
      city
      vendor {
        id
        businessName
      }
      category {
        id
        name
        slug
      }
    }
  }
`;

export const ADMIN_UPDATE_SERVICE_MUTATION = gql`
  mutation AdminUpdateService($input: UpdateServiceInput!) {
    adminUpdateService(input: $input) {
      id
      title
      status
      approvalStatus
      priceFrom
      city
      vendor {
        id
        businessName
      }
      category {
        id
        name
        slug
      }
    }
  }
`;

export const ADMIN_ARCHIVE_SERVICE_MUTATION = gql`
  mutation AdminArchiveService($serviceId: String!) {
    adminArchiveService(serviceId: $serviceId) {
      id
      status
    }
  }
`;

export const SET_USER_ACTIVE_STATUS_MUTATION = gql`
  mutation SetUserActiveStatus($input: SetUserActiveStatusInput!) {
    setUserActiveStatus(input: $input) {
      id
      isActive
    }
  }
`;

export const MARK_PAYOUT_PAID_MUTATION = gql`
  mutation MarkPayoutPaid($input: MarkPayoutInput!) {
    markPayoutPaid(input: $input) {
      id
      payoutStatus
    }
  }
`;

export const UPSERT_CMS_PAGE_MUTATION = gql`
  mutation UpsertCmsPage($input: UpsertCmsPageInput!) {
    upsertCmsPage(input: $input) {
      id
      slug
      title
      excerpt
      body
      isPublished
    }
  }
`;

export const REQUEST_VENDOR_PAYOUT_MUTATION = gql`
  mutation RequestVendorPayout($paymentId: String!) {
    requestVendorPayout(paymentId: $paymentId) {
      id
      payoutStatus
      status
    }
  }
`;

export const UPDATE_VENDOR_PROFILE_MUTATION = gql`
  mutation UpdateVendorProfile($input: UpdateVendorProfileInput!) {
    updateVendorProfile(input: $input) {
      id
      businessName
      slug
      description
      city
      state
      approvalStatus
    }
  }
`;

export const APPROVE_SERVICE_MUTATION = gql`
  mutation ApproveService($serviceId: String!, $status: ServiceApprovalStatus!) {
    approveService(serviceId: $serviceId, status: $status) {
      id
      approvalStatus
    }
  }
`;
